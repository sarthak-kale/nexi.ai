let conversationHistory = [];

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === "admin" && password === "1234") {
        document.getElementById("loginPage").classList.add("hidden");
        document.getElementById("chatbotPage").classList.remove("hidden");
    } else {
        document.getElementById("loginMsg").innerText = "❌ Invalid username or password!";
    }
}

function logout() {
    document.getElementById("chatbotPage").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
    conversationHistory = [];
}

const startBtn = document.getElementById("startBtn");
const chatBox = document.getElementById("chatBox");
const listeningStatus = document.getElementById("listeningStatus");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = true;

startBtn.addEventListener("click", () => {
    listeningStatus.innerText = "🎙 Listening...";
    recognition.start();
});

recognition.onresult = (event) => {
    let interimText = "";
    let finalText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalText += transcript;
        } else {
            interimText += transcript;
        }
    }

    if (interimText) {
        listeningStatus.innerText = "📝 " + interimText;
    }

    if (finalText) {
        listeningStatus.innerText = "";
        addMessage(finalText, "user-msg");
        sendToAI(finalText);
    }
};

function addMessage(text, className) {
    const msg = document.createElement("p");
    msg.className = className;
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendToAI(userText) {
    conversationHistory.push({ role: "user", content: userText });

    // Typing effect
    const typingMsg = document.createElement("p");
    typingMsg.className = "typing";
    typingMsg.textContent = "AI is typing...";
    chatBox.appendChild(typingMsg);

    try {
        const res = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: conversationHistory })
        });
        const data = await res.json();

        chatBox.removeChild(typingMsg);
        addMessage(data.reply, "bot-msg");
        conversationHistory.push({ role: "assistant", content: data.reply });
        speak(data.reply);
    } catch {
        chatBox.removeChild(typingMsg);
        addMessage("⚠️ Error connecting to AI.", "bot-msg");
    }
}

function speak(text) {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = synth.getVoices().find(v => v.name.includes("Google US English")) || synth.getVoices()[0];
    synth.speak(utter);
}
