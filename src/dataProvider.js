export const dataProvider = {
    getList(resource, params) {
        return Promise.resolve({ data: [], total: 0 });
    },
    getOne(resource, params) {
        
    }
}
