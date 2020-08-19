/* global Comunica */
import auth from 'solid-auth-client';
import { createDocument, fetchDocument } from 'tripledoc';
import { rdf, schema, solid, space } from 'rdf-namespaces';
import * as uuid from 'uuid';

const resourceDefinitions = {
    products: {
        schema: schema.Product,
        fields: {
            identifier: {
                schema: schema.identifier,
                type: 'xsd:string',
                documentName: 'id',
            },
            name: {
                schema: schema.name,
                type: 'xsd:string',
                fullTextSearch: true,
            },
            width: {
                schema: schema.width,
                type: 'xsd:integer',
            },
            height: {
                schema: schema.height,
                type: 'xsd:integer',
            },
        }
    },
}

const engine = Comunica.newEngine();

export const dataProvider = {
    async getList(resource, params) {
        const session = await auth.currentSession();
        const definition = resourceDefinitions[resource];

        const resourceRef = await getResourceListRef(
            session.webId,
            resource,
            definition.schema
        );

        const config = {
            sources: [resourceRef],
            httpIncludeCredentials: true,
        };

        const countQuery = `
            SELECT (COUNT(?id) as ?count)
            WHERE {
                ?s <${schema.identifier}> ?id .
                ${Object
                    .keys(definition.fields)
                    .map(buildFilter(resource, params.filter))
                    .join('\n')
                }
            }
        `;

        const countResponse = await engine.query(countQuery, config);
        const countBindings = await countResponse.bindings();
        const total = parseInt(countBindings[0].toJS()['?count'].value);

        if (total === 0) {
            return {
                data: [],
                total,
            };
        }

        const limit = params.pagination.perPage;
        const offset = (params.pagination.page - 1) * limit;
        const order = `${params.sort.order.toUpperCase()}(?${params.sort.field})`;

        const query = `
            SELECT *
            WHERE {
                ${Object
                    .keys(definition.fields)
                    .map(buildFilter(resource, params.filter))
                    .join('\n')
                }
            }
            ORDER BY ${order}
            LIMIT ${limit}
            OFFSET ${offset}
        `;

        const response = await engine.query(query, config);
        
        const bindings = await response.bindings();
        const data = bindings.map(resolveRecord(resource));

        return Promise.resolve({
            data,
            total,
        });
    },
    async create(resource, params) {
        const session = await auth.currentSession();

        if (!session || !session.webId) {
            const error = new Error();
            error.status = 401;
            throw error;
        }

        const resourceDefinition = resourceDefinitions[resource];
        const resourceDocument = await getResourceList(
            session.webId,
            resource,
            resourceDefinition.schema
        );
        const data = {
            identifier: uuid.v4(),
            ...params.data,
        }

        const record = resourceDocument.addSubject();        
        record.addRef(rdf.type, resourceDefinition.schema);
        
        Object.keys(resourceDefinition.fields).forEach(property => {
            const fieldDefinition = resourceDefinition.fields[property];
            record.addLiteral(fieldDefinition.schema, data[property]);
        });

        await resourceDocument.save([record]);
        engine.invalidateHttpCache(resourceDocument.asRef());

        return { data: {
            id: record.asRef(),
            ...data,
        } };
    },
    async deleteMany(resource, params) {
        const session = await auth.currentSession();

        if (!session || !session.webId) {
            const error = new Error();
            error.status = 401;
            throw error;
        }

        const resourceDefinition = resourceDefinitions[resource];
        const resourceDocument = await getResourceList(
            session.webId,
            resource,
            resourceDefinition.schema
        );
        
        params.ids.forEach((id) => {
            resourceDocument.removeSubject(id);
        });

        await resourceDocument.save();
        engine.invalidateHttpCache(resourceDocument.asRef());

        return { data: params.ids };
    },
    async delete(resource, params) {
        const session = await auth.currentSession();

        if (!session || !session.webId) {
            const error = new Error();
            error.status = 401;
            throw error;
        }

        const resourceDefinition = resourceDefinitions[resource];
        const resourceDocument = await getResourceList(
            session.webId,
            resource,
            resourceDefinition.schema
        );

        resourceDocument.removeSubject(params.id);
        await resourceDocument.save();
        engine.invalidateHttpCache(resourceDocument.asRef());

        return { data: params.previousData };
    }
};

const buildFilter = (resource, filter) => field => {
    const resourceDefinition = resourceDefinitions[resource];
    const definition = resourceDefinition.fields[field];

    const name = definition.documentName || field;

    // ?s typeRDF ?name
    const whereClause = `OPTIONAL { ?s <${definition.schema}> ?${name} } .`;

    if (filter.q && definition.fullTextSearch) {
        return `${whereClause} FILTER regex(?${name}, "${filter.q}", "i")`;
    }
    
    if (filter[field]) {
        return `${whereClause} FILTER (?${name} = "${filter[field]}"^^${definition.type})`;
    }

    return whereClause;
}

const resolveRecord = resource => record => {
    const definition = resourceDefinitions[resource];
    const data = record.toJS();
    return Object.keys(definition.fields).reduce((acc, field) => ({
        ...acc,
        [field]: data[`?${definition.fields[field].documentName || field}`]?.value,
    }), {
        id: data['?s'].value
    });
}

export async function getResourceListRef(webId, resource, typeRef) {
    // 1. Check if a Document tracking this resource already exists.
    const webIdDoc = await fetchDocument(webId);
    const profile = webIdDoc.getSubject(webId);
    const publicTypeIndexRef = profile.getRef(solid.publicTypeIndex);
    const publicTypeIndex = await fetchDocument(publicTypeIndexRef);
    const resourceListEntry = publicTypeIndex.findSubject(solid.forClass, typeRef);
    
    // 2. If it doesn't exist, create it
    if (resourceListEntry === null) {
        return initializeResourceList(profile, publicTypeIndex, resource, typeRef);
    }
    
    // 3. If it does exist, fetch that Document
    const resourceListRef = resourceListEntry.getRef(solid.instance);

    return resourceListRef;
}

export async function getResourceList(webId, resource, typeRef) {
    const resourceListRef = await getResourceListRef(webId, resource, typeRef);
    return fetchDocument(resourceListRef);
}

export async function initializeResourceList(profile, typeIndex, resource, typeRef) {
    // Get the root URL of the user's Pod:
    const storage = profile.getRef(space.storage);

    // Decide at what URL within the user's Pod the new Document should be stored:
    const resourceListRef = `${storage}public/${resource}.ttl`;
    // Create the new Document:
    const resourceList = createDocument(resourceListRef);
    await resourceList.save();

    // Store a reference to that Document in the public Type Index
    const typeRegistration = typeIndex.addSubject();
    typeRegistration.addRef(rdf.type, solid.TypeRegistration)
    typeRegistration.addRef(solid.instance, resourceList.asRef())
    typeRegistration.addRef(solid.forClass, typeRef)
    await typeIndex.save([ typeRegistration ]);

    // And finally, return our newly created (currently empty) list:
    return resourceList;
}