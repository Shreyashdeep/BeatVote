"use client"
import React, { use, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, ArrowDownIcon, Flag } from 'lucide-react';
import {toast, ToastContainer} from 'react-toastify'
import axios from 'axios';
import { Stream } from 'stream';
import { Appbar } from '../components/Appbar';

interface Video{
    "id":string;
    "type":string;
    "url":string;
    "extractedId":string;
    "title":string;
    "smallImg":string;
    "bigImg":string;
    "active":boolean;
    "userId":string;
    "upvotes":number;
    "haveupvoted": boolean;
}

const REFRESH_INTERVAL_MS= 10*1000;

export default function Component() {
  const [inputLink, setInputLink] = useState('');
  const [queue, setQueue] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo]=useState<Video | null>(null)
async function refreshStreams(){
    const res= await axios.get(`/api/streams/my`);
    console.log(res);

  }
  useEffect(()=>{
    refreshStreams();
    const interval= setInterval(()=>{

    }, REFRESH_INTERVAL_MS)
  },[])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newVideo: Video={
        id: String(queue.length+1),
        title: `New Song ${queue.length +1}`,
        upvotes: 0,
    }
    setQueue([...queue,newVideo])
    setInputLink('')
  };


  const handleVote = (id: string, isUpvote: boolean) => {
    setQueue(queue.map(video =>
        video.id==id
            ?{
                ...video,
                upvotes: isUpvote ? video.upvotes+1 : video.upvotes,
            }
            : video
    ).sort((a,b)=> (b.upvotes)-(a.upvotes)))
    fetch("/api/streams/upvote",{
        method: "POST",
        body: JSON.stringify({
            StreamId: id
        })
    })
  };

  const playNext=() =>{
    if(queue.length >0){
        setCurrentVideo(queue[0])
        setQueue(queue.slice(1))
    }
  }

  const handleShare =()=>{
    const shareableLink= window.location.href 
    navigator.clipboard.writeText(shareableLink).then(() => {
        toast.success('Link copied to clipboard!',{
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,

        })
    },(err)=>{
        console.error('could not copy text:', err)
        toast.error('Failed to copy link. Please try again.', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        })
    })
  }

  return (
    <div className='flex flex-col min-h-screen bg-[rbg(10,10,10)] text-grey-200'>
        <Appbar/>
        <div className='max-w-4xl mx-auto p-4 space-y-6 w-full'>
            <div className='flex justify-between items-center'>
                <h1 className='flex-3xl font-bold text-white'>song voting queue</h1>
                <Button onClick={handleShare} className='bg-purple-700 hover:bg-purple-800 text-white'>
                    <Share2 className="mr-2 h-4 w-4"/>
                </Button>
            </div>
            <form onSubmit={handleSubmit} className='space-y-2'>
                <Input
                    type="text"
                    placeholder='Paste youtube link here'
                    value={inputLink}
                    onChange={(e)=> setInputLink(e.target.value)}
                    className='bg-gray-900 text-white border-gray-7000 placeholder-gray-500'
                />
                <Button type='submit' className='w-full bg-purple-700 hover:bg-purple-800 text-white'>Add to Queue</Button>
            </form>
            {inputLink && (
                <Card className='bg-gray-900 border-gray-800'></Card>
            )}
        </div>
    </div>
  )