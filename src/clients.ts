

class Clients {
    list: any
    constructor() {
        this.list = {};
        this.saveClient = this.saveClient.bind(this);
    }
    saveClient = (userId:string, client:any) => {
        this.list[userId] = client
    }
    deleteClient = (userId:string) => {
        delete this.list[userId]
    }
}
export default Clients;



 