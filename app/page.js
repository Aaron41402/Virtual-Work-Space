import BackGround from "@/components/BackGround";
import ButtonLogin from "@/components/ButtonLogin";
import FAQListitem from "@/components/FAQListitem";
import TalkingAvatar from "@/components/TalkingAvatar";
import { auth } from "@/auth";

export default async function Home() {
  const isLoggedin = true;
  const name = "Aaron";

  const session = await auth()
  console.log(session)

  return (
    <main>
      {/* Header */}
      <section className="bg-orange-300">
        <div className="flex justify-between items-center px-8 py-2 mx-auto max-w-3xl">
          <div className="font-extrabold">VirtualWorkSpace</div>
          <div className="space-x-4 max-md:hidden">
            <a className="link link-hover" href="#pricing">Price</a>
            <a className="link link-hover" href="#faq">FAQ</a>
          </div>
          <div><ButtonLogin session={session}/></div>
        </div>
      </section>

      {/* hero */}
      <section className=" bg-[url('/wallpaper.jpeg')] bg-cover bg-center min-h-screen text-center py-32 px-8 mx-auto">
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-6">Get Started</h1>
        <div className="opacity-90 mb-10"></div>

        
        <ButtonLogin session={session}/>
      </section>

      {/* pricing */}
      <section className="bg-base-200" id="pricing">
        <div className="py-32 px-8 max-w-3xl mx-auto">
          <p className="text-sm uppercase font-medium text-center text-primary mb-4">pricing</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-12 text-center">A pricing that adapts to your needs</h2>


          <div className="p-8 bg-base-100 w-96 rounded-3xl mx-auto space-y-6">
            <div className="flex gap-2 items-baseline">
              <div className="text-4xl font-black">$5</div>
              <div className="uppercase text-sm font-medium opacity-60">/month</div>
            </div>

            <ul className="space-y-2">
              <li className="flex gap-3 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="text-green-500 size-4">
                  <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z" clipRule="evenodd" />
                </svg>
                Collect customer feedback
              </li>
              <li className="flex gap-3 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="text-green-500 size-4">
                  <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z" clipRule="evenodd" />
                </svg>
                Unlimited boards
              </li>
              <li className="flex gap-3 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="text-green-500 size-4">
                  <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z" clipRule="evenodd" />
                </svg>
                Admin dashboard
              </li>
              <li className="flex gap-3 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="text-green-500 size-4">
                  <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z" clipRule="evenodd" />
                </svg>
                24/7 support
              </li>
            </ul>
            <ButtonLogin session={session} extraStyle="w-full"/>
          </div>
        </div>

      </section>

      {/* FAQ */}
      <section className="bg-base-200" id="faq">
        <div className="py-32 px-8 max-w-3xl mx-auto">
          <p className="text-green-600 text-sm uppercase font-medium text-center">FAQ</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-12 text-center">Frequently Asked Questions</h2>

          <ul className="max-w-lg, mx-auto">
          {
            [
              {question: "What do I get exactly", answer: "A"},
              {question: "Can I get a refund", answer: "B"},
              {question: "I have another question", answer: "C"},
            ].map((qa) => (
            <FAQListitem qa={qa} key={qa.question}/>  
            ))
          }
        </ul>
        </div>

      </section>
    </main>
  );
}
