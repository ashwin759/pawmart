Upgrade the memory system of the existing local AI automation agent to work exactly like Claude, ChatGPT, and Gemini. The agent must remember everything about the user automatically across all sessions and respond in a personalized context-aware way at all times.

Do the following changes and upgrades:

---

TASK 1 — CREATE FILE: memory/auto_memory.py

Create this file completely with the following functions:

Load and save memory from memory/long_term.json as a JSON key-value store.

remember(key, value) — store a key-value pair
recall(key) — get value by key, return None if not found
recall_all() — return all stored memory as formatted string
forget(key) — delete a key from memory
clear_all() — wipe entire memory file
track_action(action_name) — increment action frequency counter in memory
track_search(query) — append query to frequent_searches list in memory, max 20 items
update_last_context(key, value) — store last used URL, file, search under last_context

auto_extract_and_store(user_input) — this is the most important function. It must silently scan every user message and automatically extract and store the following without the user needing to say remember:

- Name: detect patterns like "my name is X", "I am X", "I'm X", "call me X"
- Age: detect patterns like "I am 22 years old", "I'm 22"
- Location: detect patterns like "I live in X", "I'm from X", "based in X", "located in X"
- Occupation: detect patterns like "I am a X", "I work as a X", "I'm a X"
- OS: detect if user mentions windows, mac, macos, linux, ubuntu
- Browser: detect if user says they use or prefer chrome, firefox, edge, brave, safari
- Theme: detect if user mentions dark mode or light mode
- Project name: detect patterns like "my project is X", "project called X", "working on X"
- Music preference: detect if user says they love or like or listen to lofi, classical, jazz, pop, rock, hip hop, edm
- Diet: detect if user mentions vegetarian or vegan

Save all extracted data to long_term.json automatically.

---

TASK 2 — REBUILD FILE: memory/short_term.py

Rebuild this file as a clean class called ShortTermMemory with max 20 messages.

Methods needed:
- add(role, content) — add message, remove oldest if over limit
- get_history() — return formatted string of all messages as "User: ..." and "Agent: ..."
- clear() — reset messages list
- get_last_user_message() — return last message where role is user
- get_last_agent_message() — return last message where role is agent

---

TASK 3 — UPDATE FILE: core/interpreter.py

Make these exact changes:

At the top import auto_extract_and_store, recall_all, track_action, track_search from memory.auto_memory and import ShortTermMemory from memory.short_term.

Create a single shared instance of ShortTermMemory called short_term at the top of the file.

In the interpret(user_input) function do these steps in order:
Step 1 — call auto_extract_and_store(user_input) to silently extract and store anything useful
Step 2 — call short_term.add("user", user_input)
Step 3 — build the prompt by replacing {conversation_history} with short_term.get_history() and {user_memory} with recall_all() and {user_input} with the actual input
Step 4 — send prompt to Ollama API using model qwen2.5 with stream False
Step 5 — parse the JSON response safely, if JSON parsing fails use regex to find JSON object in response, if that also fails return default action answer_general with the user input as query
Step 6 — call track_action with the action name from the parsed JSON
Step 7 — if action is search_google call track_search with the query parameter
Step 8 — return the parsed action JSON

---

TASK 4 — UPDATE FILE: memory/long_term.json

Make sure this file is created automatically if it does not exist. Default content is just an empty JSON object {}.

---

TASK 5 — UPDATE THE SYSTEM PROMPT INSIDE interpreter.py

Add this block to the existing system prompt. Insert it just before the USER MEMORY and CONVERSATION HISTORY placeholders at the bottom:

MEMORY AWARENESS RULES:
You have full access to everything known about the user in USER MEMORY. Use this naturally like a personal assistant who knows the user well.

If the user name is known use it occasionally but not in every single message.
If the user location is known use it automatically for weather or local queries without asking.
If the user preferences are known apply them without being asked.
Never say you do not know who the user is if their info is already in memory.
Never ask for information you already have stored in memory.

Behavior examples:
If memory has user_name as Arun and user_location as Chennai and user asks what is the weather then automatically use Chennai as the location parameter without asking.
If memory has user_name as Arun and user asks who am I then answer using their stored name and any other stored facts.
If memory has user_project as AutoAgent and user asks about their project then respond using that project name.
If memory has user_music as lofi and user says play something then open YouTube with lofi music automatically.

---

TASK 6 — UPDATE FILE: main.py

Add these special commands to the main input loop before sending input to the interpreter:

If user types "show memory" — call recall_all() and print all stored long-term memory with a header
If user types "what do you know about me" — same as show memory, print everything stored nicely formatted
If user types "forget everything" — call clear_all() and print confirmation
If user types "forget my name" — call forget("user_name") and print confirmation
If user types "clear memory" — call short_term.clear() and print confirmation that short term memory was cleared
If user types "history" — call short_term.get_history() and print it

After every agent response store the result in short_term by calling short_term.add("agent", result).

---

TASK 7 — UPDATE FILE: core/router.py

Make sure the remember and recall actions are handled properly:

If action is remember — get key and value from parameters and call remember(key, value) from auto_memory and print confirmation with checkmark emoji
If action is recall — get key from parameters and call recall(key) from auto_memory and print result or a not found message
If action is recall_all — call recall_all() and print everything

---

EXPECTED BEHAVIOR AFTER ALL CHANGES

User says "I am Arun from Chennai" — agent silently stores user_name as Arun and user_location as Chennai automatically with no command needed.

Next session the agent already knows the name and location.

User asks "what is the weather" — agent automatically uses stored Chennai as location without asking.

User says "play something" — agent uses stored music preference automatically.

User says "what do you know about me" — agent prints everything it has stored.

User says "forget my name" — agent removes only the name from memory.

The memory works exactly like Claude and ChatGPT persistent memory — always on, always learning, always personalizing.

Do not change anything else in the project. Only make the changes listed in the 7 tasks above.