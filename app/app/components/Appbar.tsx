"use client";
import { signIn } from "next-auth/react";

export function Appbar(){
    return(
        <div className="flex justify-between">
            <div>
                BeatVote
            </div>
            <div>
                <button className="m-2 p-2 bg-blue-400" onClick={() => signIn()}>Signin</button>
            </div>
        </div>

    );
}