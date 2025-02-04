import Link from 'next/link'
import React from 'react'

function ButtonLogin({isLoggedin, name}) {
    if(isLoggedin){
        return (
            <Link href="/dashboard" className='btn btn-primary'>Welcome Back {name}</Link>
        )
    }
    else {
        return <button>Login</button>
    }
}

export default ButtonLogin