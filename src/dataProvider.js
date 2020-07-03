import auth from 'solid-auth-client';
import { createDocument, fetchDocument } from 'tripledoc';
import { rdf, schema, solid, space } from 'rdf-namespaces';

const resourceDefinitions = {
    products: {
        schema: schema.Product,
        fields: {
            id: {
                schema: schema.identifier,
                type: String,
            },
            name: {
                schema: schema.name,
                type: String,
            },
            // reference: {
            //     schema: schema.productID,
            //     type: String,
            // },
            // width: {
            //     schema: schema.width,
            //     type: Number,
            // },
            // height: {
            //     schema: schema.height,
            //     type: Number,
            // },
            // description: {
            //     schema: schema.description,
            //     type: String,
            // }
        }
    },
}

export const dataProvider = {
    async getList(resource, params) {
        const session = await auth.currentSession();

        if (!session || !session.webId) {
            const error = new Error();
            error.status = 401;
            throw error;
        }

        const resourceDocument = await getResourceList(
            session.webId,
            resource,
            resourceDefinitions[resource].schema
        );
        const records = resourceDocument.getSubjectsOfType(
            resourceDefinitions[resource].schema
        );
        
        return Promise.resolve({
            data: records.map(resolveResource(resource)),
            total: records.length,
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

        const record = resourceDocument.addSubject();        
        record.addRef(rdf.type, resourceDefinition.schema);
        
        Object.keys(resourceDefinition.fields).forEach(property => {
            const fieldDefinition = resourceDefinition.fields[property];
            switch (fieldDefinition.type) {
                case String:
                    record.addString(fieldDefinition.schema, params.data[property]);
                    break;
                case Number:
                    record.addNumber(fieldDefinition.schema, params.data[property]);
                    break;
                default:
                    console.log('Unknown type');
                    break;
            }
        });

        await resourceDocument.save([record]);
        return { data: record };
    }
};

function resolveResource(resource) {
    const resourceDefinition = resourceDefinitions[resource];
    return record => {
        return Object.keys(resourceDefinition.fields).reduce((acc, field) => {
            const fieldDefinition = resourceDefinition.fields[field];
            switch(fieldDefinition.type) {
                case String:
                    acc[field] = record.getString(fieldDefinition.schema);
                    break;
                case Number:
                    acc[field] = record.getNumber(fieldDefinition.schema);
                    break;
                default:
                    console.log('Unknown type');
                    break;
            }
            return acc;
        }, {});
    }
}

export async function getResourceList(webId, resource, typeRef) {
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