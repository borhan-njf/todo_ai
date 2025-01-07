// import "./App.css";
import Groq from "groq-sdk";
import { useEffect, useState } from "react";

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

  async function main() {
    const chatCompletion = await getGroqChatCompletion();
    // Print the completion returned by the LLM.
    // console.log(chatCompletion.choices[0]?.message?.content || "");
    const tasks = parseTasks(chatCompletion.choices[0]?.message?.content || "");
    setTodoList(tasks);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content: chatCompletion.choices[0]?.message?.content || "",
      },
    ]);
  }

  async function getGroqChatCompletion() {
    return groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "i am going to create a to-do list from user's posted text",
        },
        ...messages, // Include previous messages
        {
          role: "user",
          content: userInput, // Use user input
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userInput }, // Add user message
    ]);
    main(); // Call main to get assistant response
    setUserInput(""); // Clear input field
  };

  function parseTasks(content: string): string[] {
    const lines = content.split("\n"); // تقسیم متن به خطوط
    const tasks: string[] = [];

    for (const line of lines) {
      const regex = /^\d+\.\s*(.*)$/; // الگوی regex برای شناسایی خطوط لیست
      const match = line.match(regex);
      if (match) {
        tasks.push(match[1].trim()); // اضافه کردن کار به لیست
      }
    }

    console.log("Extracted tasks:", tasks);
    return tasks; // برگرداندن لیست کارها
  }

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
                  {msg.content}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* to-list board */}
        <div className="w-[40%]">
          <h1 className="text-2xl font-medium mb-5"> TODO List Board </h1>

          <div className="border-4 rounded-lg border-violet-700 w-full h-[600px]">
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
