import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { number, z } from "zod";
// @ts-ignore
import youtubesearchapi from "youtube-search-api";

var YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;



const CreateStreamSchema=z.object({
    creatorId: z.string(),
    url: z.string()
})
export async function POST(req:NextRequest) {
    try {
        const data= CreateStreamSchema.parse(await req.json());
        const isYt= data.url.match(YT_REGEX);
        if(!isYt){
            return NextResponse.json({
                message: "Wrong url formal"
            },{
                status: 411
            })
        }
        const extractedId= data.url.split("?v=")[1];
        const res= await youtubesearchapi.GetVideoDetails(extractedId);
        console.log(res.title);
        console.log(res.thumbnail.thumbnails);
        const thumbnails=res.thumbnail.thumbnails;
        thumbnails.sort((a: {width: number}, b: {width: number})=> a.width<b.width ? -1 : 1);

        const stream=await prismaClient.stream.create({
           data:{
            userId: data.creatorId,
            url: data.url,
            type: "Youtube",
            extractedId,
            title: res.title ?? "Cant find video",
            smallImg:(thumbnails.length>1 ? thumbnails[thumbnails.length -2 ].url : thumbnails[thumbnails.length-1].url) ?? "https://i.pinimg.com/originals/20/83/3d/20833d3b448c8c0676e6d29d13fc07cc.gif",
            bigImg: thumbnails[thumbnails.length -1].url ?? "https://i.pinimg.com/originals/20/83/3d/20833d3b448c8c0676e6d29d13fc07cc.gif"
           }
        })
        return NextResponse.json({
            message: "Added stream",
            id: stream.id
        })
        
    } catch (e) {
        console.log(e);
        return NextResponse.json({
            message: "error while adding a stream"
        },{
            status: 411
        }
        )
        
    }
    
}

export async function GET(req:NextRequest) {
    const creatorId= req.nextUrl.searchParams.get("creatorId");
    const streams= await prismaClient.stream.findMany({
        where: {
            userId: creatorId ?? ""
        }
    })
    return NextResponse.json({
        streams
    })
    
}