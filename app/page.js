
import ButtonLogin from "@/components/ButtonLogin";
export default function Home() {
  const isLoggedin = true;
  const name = "Aaron";

  return (
    <main>
      <section className="bg-orange-300">
        <div className="flex justify-between items-center px-8 py-2 mx-auto max-w-3xl">
          <div className="font-extrabold">FirstTest</div>
          <div className="space-x-4 max-md:hidden">
            <a className="link link-hover">Price</a>
            <a className="link link-hover">FAQ</a>
          </div>
          <div><ButtonLogin isLoggedin={isLoggedin} name={name}/></div>
        </div>
      </section>
      <section className="text-center py-32 px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-6">Get Started</h1>
        <div className="opacity-90 mb-10">Create a feedback</div>

        
        <ButtonLogin isLoggedin={isLoggedin} name={name}/>
      </section>
    </main>
  );
}
