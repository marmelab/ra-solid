import * as React from 'react'

export function ValueFromLDflexObject(props) {
    const value = useValueFromLDflexObject(props.object, props.path);

    return value;
}

export const useValueFromLDflexObject = (object, path) => {
    const [state, setState] = React.useState(null);
    
    React.useEffect(() => {
        if (!object) {
            return;
        }

        object[path].then(value => setState(value.toString()))
    }, [object, path]);

    return state;
}