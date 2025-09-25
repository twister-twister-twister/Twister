// Twister main client logic
// Wait for Supabase client to be available
function waitForSupabase(cb) {
  if (window.supabase) {
    cb();
  } else {
    setTimeout(() => waitForSupabase(cb), 100);
  }
}

waitForSupabase(() => {
  // --- Navigation ---
  const pages = ["feed", "explore", "chat", "profile", "settings"];
  function showPage(page) {
      pages.forEach(p => {
          document.getElementById(`page-${p}`).classList.remove("active");
      });
      document.getElementById(`page-${page}`).classList.add("active");
  }
  pages.forEach(page => {
      document.getElementById(`nav-${page}`).onclick = e => {
          e.preventDefault();
          showPage(page);
      };
  });

  // --- Feed ---
  async function loadFeed() {
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      const feed = document.getElementById('feed-posts');
      feed.innerHTML = '';
      if (error) {
          feed.textContent = 'Failed to load feed.';
          return;
      }
      data.forEach(post => {
          const div = document.createElement('div');
          div.className = 'post';
          div.innerHTML = `<b>@${post.username}</b>: ${post.content} <span class='date'>${new Date(post.created_at).toLocaleString()}</span>`;
          feed.appendChild(div);
      });
  }
  document.getElementById('post-form').onsubmit = async e => {
      e.preventDefault();
      const content = document.getElementById('post-content').value.trim();
      if (!content) return;
      // For demo, use a static username
      const username = localStorage.getItem('twister_username') || 'anon';
      await supabase.from('posts').insert([{ username, content }]);
      document.getElementById('post-content').value = '';
      loadFeed();
  };

  // --- Explore ---
  document.getElementById('explore-search').oninput = async e => {
      const q = e.target.value.trim();
      const results = document.getElementById('explore-results');
      if (!q) {
          results.innerHTML = '';
          return;
      }
      const { data, error } = await supabase.from('posts').select('*').ilike('content', `%${q}%`).order('created_at', { ascending: false });
      results.innerHTML = '';
      if (error) {
          results.textContent = 'Search failed.';
          return;
      }
      data.forEach(post => {
          const div = document.createElement('div');
          div.className = 'post';
          div.innerHTML = `<b>@${post.username}</b>: ${post.content} <span class='date'>${new Date(post.created_at).toLocaleString()}</span>`;
          results.appendChild(div);
      });
  };

  // --- Chat ---
  async function loadChats() {
      const { data, error } = await supabase.from('chats').select('*');
      const chatList = document.getElementById('chat-list');
      chatList.innerHTML = '';
      if (error) {
          chatList.textContent = 'Failed to load chats.';
          return;
      }
      data.forEach(chat => {
          const div = document.createElement('div');
          div.className = 'chat-item';
          div.textContent = chat.title || `Chat #${chat.id}`;
          div.onclick = () => openChat(chat.id);
          chatList.appendChild(div);
      });
  }
  async function openChat(chatId) {
      document.getElementById('chat-window').style.display = '';
      const { data, error } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true });
      const chatMessages = document.getElementById('chat-messages');
      chatMessages.innerHTML = '';
      if (error) {
          chatMessages.textContent = 'Failed to load messages.';
          return;
      }
      data.forEach(msg => {
          const div = document.createElement('div');
          div.className = 'message';
          div.innerHTML = `<b>@${msg.username}</b>: ${msg.content} <span class='date'>${new Date(msg.created_at).toLocaleString()}</span>`;
          chatMessages.appendChild(div);
      });
      document.getElementById('chat-form').onsubmit = async e => {
          e.preventDefault();
          const content = document.getElementById('chat-input').value.trim();
          if (!content) return;
          const username = localStorage.getItem('twister_username') || 'anon';
          await supabase.from('messages').insert([{ chat_id: chatId, username, content }]);
          document.getElementById('chat-input').value = '';
          openChat(chatId);
      };
  }

  // --- Profile ---
  async function loadProfile() {
      const username = localStorage.getItem('twister_username') || 'anon';
      const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single();
      const info = document.getElementById('profile-info');
      if (error || !data) {
          info.textContent = 'Profile not found.';
          return;
      }
      info.innerHTML = `<b>@${data.username}</b><br>${data.bio || ''}`;
      // Load user's posts
      const { data: posts, error: postErr } = await supabase.from('posts').select('*').eq('username', username).order('created_at', { ascending: false });
      const profilePosts = document.getElementById('profile-posts');
      profilePosts.innerHTML = '';
      if (postErr) {
          profilePosts.textContent = 'Failed to load posts.';
          return;
      }
      posts.forEach(post => {
          const div = document.createElement('div');
          div.className = 'post';
          div.innerHTML = `${post.content} <span class='date'>${new Date(post.created_at).toLocaleString()}</span>`;
          profilePosts.appendChild(div);
      });
  }

  // --- Settings ---
  document.getElementById('settings-form').onsubmit = async e => {
      e.preventDefault();
      const displayname = document.getElementById('settings-displayname').value.trim();
      const bio = document.getElementById('settings-bio').value.trim();
      const username = localStorage.getItem('twister_username') || 'anon';
      await supabase.from('profiles').upsert({ username, displayname, bio });
      localStorage.setItem('twister_username', username);
      alert('Settings saved!');
      loadProfile();
  };

  // --- Initial Load ---
  loadFeed();
  loadChats();
  loadProfile();
  showPage('feed');
});


