import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-row justify-between items-center bg-primary min-h-screen ">
      <div className="w-[15%] min-h-screen">
      </div>

      <div className="bg-right-nav w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden">
        <div className="w-[20%] bg-left-nav"></div>
        <div className="w-[80%] bg-right-nav"></div>
      </div>
    </div>
  );
}
