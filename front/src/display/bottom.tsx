import React from "react"

export  default function Bottom({children} : { children: React.ReactNode })
{
    return(
        <main className="bg-gradient-to-br from-rose-500 to-orange-500 min-h-screen flex flex-col justify-between p-8 w-full">
            {children}
        </main>
        
    );
}