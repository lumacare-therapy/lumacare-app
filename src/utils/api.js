// API utility for OpenRouter with better error handling
export const callOpenRouter = async (messages, model = 'mistralai/mistral-7b-instruct:free') => {
  const OPENROUTER_KEY = process.env.REACT_APP_OPENROUTER_KEY;
  
  if (!OPENROUTER_KEY) {
    console.error('❌ OpenRouter API key is missing! Check your .env file');
    return null;
  }

  console.log('📡 Calling OpenRouter API with model:', model);
  console.log('🔑 API Key exists:', OPENROUTER_KEY ? 'Yes' : 'No');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'LumaCare Wellness',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.8,
        max_tokens: 250,
        top_p: 0.9,
      }),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // Try fallback model if first one fails
      if (model === 'mistralai/mistral-7b-instruct') {
        console.log('🔄 Trying fallback model...');
        return await callOpenRouter(messages, 'openai/gpt-3.5-turbo');
      }
      
      return null;
    }

    const data = await response.json();
    console.log('✅ OpenRouter API success');
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error('❌ OpenRouter API network error:', error);
    return null;
  }
};

// Fallback responses when API fails
export const getFallbackResponse = (userMessage) => {
  const lowerMsg = userMessage.toLowerCase();
  
  if (lowerMsg.includes('anxi') || lowerMsg.includes('panic') || lowerMsg.includes('nervous') || lowerMsg.includes('stress')) {
    return "I hear that anxiety is really getting to you. You know what helps me when I feel like that? Box breathing. It's simple - inhale for 4, hold for 4, exhale for 4, hold for 4. It calms your nervous system pretty quickly. Want to try it together? 🧘";
  }
  else if (lowerMsg.includes('overwhelm') || lowerMsg.includes('too much') || lowerMsg.includes('stressed') || lowerMsg.includes('busy')) {
    return "That sounds like a lot to handle. When I get overwhelmed, the Priority Matrix helps me sort through everything. It helps you figure out what's actually urgent vs what can wait. Would you like me to show you how it works? 📌";
  }
  else if (lowerMsg.includes('negative') || lowerMsg.includes('thought') || lowerMsg.includes('self-doubt') || lowerMsg.includes('bad')) {
    return "Those negative thoughts can be really convincing, can't they? There's this technique called Cognitive Restructuring that helps challenge them. I could guide you through it if you're interested - it's helped me before. 🧠";
  }
  else if (lowerMsg.includes('focus') || lowerMsg.includes('concentrate') || lowerMsg.includes('distracted') || lowerMsg.includes('procrastinate')) {
    return "Ugh, struggling with focus is the worst. The Pomodoro Technique has been a game-changer for me - you work for 25 minutes, then take a 5-minute break. Want to give it a try? ⏰";
  }
  else if (lowerMsg.includes('panic') || lowerMsg.includes('disconnect') || lowerMsg.includes('unreal') || lowerMsg.includes('scared')) {
    return "That feeling of being disconnected or panicky is really scary. Grounding techniques help bring you back to the present. There's one called 5-4-3-2-1 where you notice things around you. Want to try it with me? 🌱";
  }
  else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return "👋 Hi there! I'm really glad you're here. How are you feeling today?";
  }
  else if (lowerMsg.includes('tired') || lowerMsg.includes('exhausted') || lowerMsg.includes('sleep')) {
    return "Being tired can make everything feel harder. The 4-7-8 breathing technique is great for relaxation and sleep. Inhale for 4, hold for 7, exhale for 8. Want to try it together? 🌙";
  }
  else {
    return "I'm really glad you're here. What's been on your mind lately? I'm all ears, and if there's something specific you're dealing with, I might know some techniques that could help. 💙";
  }
};
