"use client";
import Link from 'next/link';
import React from 'react';
import { signIn } from 'next-auth/react';
import styled from 'styled-components';

function ButtonLogin({ session, extraStyle }) {
    const setupUrl = "/setup";
    const dashboardUrl = "/dashboard";
    const targetUrl = session?.user?.hasCompletedSetup ? dashboardUrl : setupUrl;

    const buttonContent = session ? 
        `Welcome Back ${session.user.name || "friend"}` : 
        "Get Started";

    const StyledButton = ({ onClick, children }) => (
        <StyledWrapper>
            <button className="button" onClick={onClick}>
                <span className="label">{children}</span>
                <span className="gradient-container">
                    <span className="gradient" />
                </span>
            </button>
        </StyledWrapper>
    );

    if (session) {
        return (
            <Link href={targetUrl}>
                <StyledButton>{buttonContent}</StyledButton>
            </Link>
        );
    }

    return (
        <StyledButton onClick={() => signIn(undefined, { callbackUrl: targetUrl })}>
            {buttonContent}
        </StyledButton>
    );
}

const StyledWrapper = styled.div`
    .button {
        border: none;
        outline: none;
        background-color: #2A2136;
        min-width: 180px;
        height: 60px;
        font-size: 16px;
        color: #E6C86E;
        font-weight: 600;
        border-radius: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        position: relative;
        transition: all 0.3s;
        font-family: 'Press Start 2P', monospace;
        text-shadow: 2px 2px 0 #000;
        border: 2px solid #E6C86E;
        overflow: hidden;
    }

    .button::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 4px 4px 0 #000;
        width: 106%;
        height: 120%;
        z-index: -1;
        transition: all 0.3s;
        border-radius: 12px;
    }

    .gradient-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 106%;
        height: 115%;
        overflow: hidden;
        z-index: -2;
        filter: blur(10px);
        transition: all 0.3s;
        border-radius: 12px;
    }

    .gradient {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 110%;
        aspect-ratio: 1;
        transition: all 0.3s;
        background-image: linear-gradient(
            90deg,
            #E6C86E,
            #FF6B97,
            #8BABBF,
            #E6C86E
        );
        animation: rotate 3s linear infinite;
        filter: blur(10px);
    }

    .label {
        position: relative;
        width: calc(100% - 8px);
        height: calc(100% - 8px);
        text-align: center;
        background-color: #2A2136;
        font-size: 14px;
        padding: 0 20px;
        letter-spacing: 0.5px;
        transition: all 0.3s;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .button:hover {
        transform: translateY(-2px);
        border-color: #FF6B97;
    }

    .button:hover .label {
        border-radius: 10px;
        background-color: #3A2E56;
    }

    .button:hover .gradient-container {
        filter: blur(15px);
    }

    .button:hover .gradient {
        filter: blur(15px);
    }

    .button:active {
        transform: translateY(2px);
    }

    .button:active .label {
        transform: scale(0.95);
    }

    @keyframes rotate {
        0% {
            transform: translate(-50%, -50%) rotate(0deg);
        }
        100% {
            transform: translate(-50%, -50%) rotate(360deg);
        }
    }
`;

export default ButtonLogin;