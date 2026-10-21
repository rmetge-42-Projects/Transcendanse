import Bottom from "../../display/bottom";
import Navigation from "../../display/navigation";
import { User } from "lucide-react";

export default function ProfileCard({
  children,
  photo,
}: {
  children: React.ReactNode;
  photo?: string | null;
}) {
  return (
    <Bottom>
      <div className="relative max-w-4xl mx-auto min-h-[75vh] flex flex-col justify-between px-6 py-10">
        
        <div className="flex flex-col items-center mt-20 bg-white border border-gray-200/80 rounded-3xl shadow-xl p-8 md:p-12 w-full text-center">
          
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-blue-950 flex items-center justify-center shadow-2xl mb-6 border-8 border-white -mt-24 md:-mt-28 overflow-hidden">
            {photo ? (
              <img
                src={photo}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-24 h-24 md:w-30 md:h-30 text-white" />
            )}
          </div>

          {children}

        </div>
      </div>
      <Navigation />
    </Bottom>
  );
}