

export default function EditCard({title, children} : {title: string; children: React.ReactNode }){

    return(
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
               {title}
            </h1>
            {children}
        </div>
    );
}