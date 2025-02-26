"use client";
import Link from 'next/link'
import React from 'react'
import { signIn } from 'next-auth/react';

function ButtonLogin({session, extraStyle}) {
    const dashboardUrl = "/dashboard";

    if(session){
        return (
            <Link href={dashboardUrl} className={`btn btn-primary ${extraStyle ? extraStyle : ""}`}>Welcome Back {session.user.name || "friend"}</Link>
        );
    }
    return (
        <button
        className={`btn btn-primary ${extraStyle ? extraStyle : ""}`}
        onClick={() => {signIn(undefined, { callbackUrl: dashboardUrl});
        }}
        >Get Started</button>
    )

    // 1. create a login page

    // 2. create a email/password form

    // 3. Make a POST request to /api/login

};

export default ButtonLogin