import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Google from "next-auth/providers/google"
import clientPromise from "./libs/mongo";

const config = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        })
    ],
    adapter: MongoDBAdapter(clientPromise)
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);