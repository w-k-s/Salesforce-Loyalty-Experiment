import { createTransaction } from './transactions.service.js'

export async function create(req, res) {
    try{
        const result = await createTransaction()
        res.status(201).json({"Id": result})
    }catch(e){
        console.error(e);
    }
}