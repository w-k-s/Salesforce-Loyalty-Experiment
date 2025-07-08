export interface LoyaltyCRM {
    createContact(params: CreateContactRequest): Promise<ContactId | 'CONTACT_EXISTS'>
    findMemberById(id: string): Promise<Contact>
    listProducts(): Promise<Product[]>
    createTransaction(params: CreateTransactionJournal): Promise<TransactionId>
}

export interface Product {
    id: string;
    name: string;
    code: string;
    unitPrice: string;
}

export type CreateContactRequest = {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    birthDate?: Date;
};

export interface Contact {
    id: ContactId
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    birthDate?: Date;
}

export interface CreateTransactionProductLine {
    id: ProductId
    quantity: number
}

export interface CreateTransactionJournal {
    contactId: ContactId
    date: Date;
    description?: string;
    products: CreateTransactionProductLine[]
}

export type ContactId = string
export type TransactionId = string
export type ProductId = string