// import "./App.css";
import Groq from "groq-sdk";
import { useState } from "react";
import Loading from "./Loading";
import { onEnterPress, parseTasks } from "./helpers";

type Message = {
  role: string;
  content: string;
};

function App() {
  const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [todoList, setTodoList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errMessage, setErrMessage] = useState<string>("");

  async function main() {
    try {
      setIsLoading(true);
      const chatCompletion = await getGroqChatCompletion();
      const tasks = parseTasks(
        chatCompletion.choices[0]?.message?.content || ""
      );
      setTodoList(tasks);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: chatCompletion.choices[0]?.message?.content || "",
        },
      ]);
      setIsLoading(false);
      setErrMessage("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
      setErrMessage("something went wrong, try again later");
    }
  }

  async function getGroqChatCompletion() {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as "system" | "user" | "assistant", // Ensure role is one of the expected types
      content: msg.content,
    }));
    return groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "I am going to create a to-do list from the text the user sends me and display the items on this list with numbers. If the user sends text that is not related to their to-do list, I will respond by asking them to tell me the tasks they want to accomplish within a specific time frame.",
        },
        ...formattedMessages,
        {
          role: "user",
          content: userInput,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_tokens: 3760,
      top_p: 1,
      stream: false,
      stop: null,
    });
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput) {
      setErrMessage("the field is empty!");
      return;
    }
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userInput },
    ]);
    main();
    setUserInput("");
    setErrMessage("");
  };

  return (
    <>
      <div className="flex gap-10 w-screen px-10 py-8 font-sans">
        {/* conversation board */}
        <div className="w-[60%]">
          <h1 className="text-2xl font-medium mb-5">Conversation Board</h1>
          <section className="w-full">
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full mx-auto block text-xl h-[40vh] px-3 py-4 border rounded border-violet-700"
                name="textarea"
                id="todo"
                placeholder="write down the TASKS you want to do in order of priority here"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => onEnterPress(e, handleSubmit)}
              />
              <div className="flex justify-end mt-2 my-4">
                <button
                  type="submit"
                  className="w-[150px] border border-violet-500"
                >
                  Send
                </button>
              </div>
            </form>
            <div>
              {messages.map((msg, index) => (
                <div key={index} className="my-2">
                  <strong className="text-violet-400">{msg.role}</strong> :{" "}
                  {msg.role !== "assistant" &&
                  index == messages.length - 1 &&
                  isLoading ? (
                    <Loading />
                  ) : (
                    msg.content
                  )}
                </div>
              ))}
            </div>
            <p className="text-red-600 font-medium text-lg">{errMessage}</p>
          </section>
        </div>

        {/* to-list board */}
        <div className="w-[30%] mx-auto">
          <h1 className="text-2xl font-medium mb-5"> TODO List Board </h1>

          <div className="border-4 rounded-lg border-violet-700 w-full h-[80vh] overflow-y-auto">
            {todoList.length ? (
              <ul className="py-10 px-12">
                {todoList.map((task, index) => (
                  <li key={index} className="flex items-center gap-5 my-5">
                    <input
                      type="checkbox"
                      id={`task-${index}`}
                      className="custom-checkbox"
                    />
                    <label htmlFor={`task-${index}`} className="task-label">
                      {task}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-2xl py-10 px-20 leading-10 font-mono">
                have a conversation with Groq to get your <b>TODO</b> list
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
