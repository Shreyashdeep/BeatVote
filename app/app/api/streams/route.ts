import { prismaClient } from "@/app/lib/db";
import Spotify from "next-auth/providers/spotify";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const YT_REGEX=new RegExp("^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})$")



const CreateStreamSchema=z.object({
    creatorId: z.string(),
    url: z.string()
})
export async function POST(req:NextRequest) {
    try {
        const data= CreateStreamSchema.parse(await req.json());
        const isYt= YT_REGEX.test(data.url);
        if(!isYt){
            return NextResponse.json({
                message: "Wrong url formal"
            },{
                status: 411
            })
        }
        const extractedId= data.url.split("?v=")[1];
        await prismaClient.stream.create({
           data:{
            userId: data.creatorId,
            url: data.url,
            type: "Youtube",
            extractedId
           }
        })
        
    } catch (e) {
        return NextResponse.json({
            message: "error while adding a stream"
        },{
            status: 411
        }
        )
        
    }
    
}