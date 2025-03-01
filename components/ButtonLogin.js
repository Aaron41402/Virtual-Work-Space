"use client";
import Link from 'next/link';
import React from 'react';
import { signIn } from 'next-auth/react';

function ButtonLogin({ session, extraStyle }) {
    const setupUrl = "/setup";
    const dashboardUrl = "/dashboard";

    // Determine redirect based on setup completion
    const targetUrl = session?.user?.hasCompletedSetup ? dashboardUrl : setupUrl;

    if (session) {
        return (
            <Link href={targetUrl} className={`btn btn-primary ${extraStyle || ""}`}>
                Welcome Back {session.user.name || "friend"}
            </Link>
        );
    }

    return (
        <button
            className={`btn btn-primary ${extraStyle || ""}`}
            onClick={() => signIn(undefined, { callbackUrl: targetUrl })}
        >
            Get Started
        </button>
    );
}

export default ButtonLogin;