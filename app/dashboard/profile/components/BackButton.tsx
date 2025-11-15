'use client';

import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React from 'react'

const BackButton = () => {
	const router = useRouter();

	const handleBack = () => {
		router.back()
	}
	return (
		<Button onClick={() => handleBack()} variant="ghost" 
			className="absolute top-5 left-5 cursor-pointer text-text-primary p-0 ">
			<ChevronLeft size={25}/>
		</Button>
	)
}

export default BackButton