// Twister main client logic
// Wait for Supabase client to be available
function waitForSupabase(callback) {
    if (window.supabase) {
        callback(window.supabase);
    } else {
        setTimeout(() => waitForSupabase(callback), 50);
    }
}

waitForSupabase(async (supabase) => {
    console.log("Supabase client is ready.");

    const renderPost = (post) => `
        <div class="post">
            <div class="post-header">
                <strong class="post-username">${post.username || 'anon'}</strong>
                <span class="post-timestamp">${new Date(post.created_at).toLocaleString()}</span>
            </div>
            <p class="post-content">${post.content}</p>
        </div>
    `;

    // --- Page-specific logic ---

    // Run Feed page logic
    if (document.getElementById('page-feed')) {
        const postForm = document.getElementById('post-form');
        const postContent = document.getElementById('post-content');
        const feedPosts = document.getElementById('feed-posts');

        const loadFeed = async () => {
            const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
            if (error) {
                console.error("Error loading feed:", error);
                return;
            }
            feedPosts.innerHTML = data.map(renderPost).join('');
        };

        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = postContent.value.trim();
            if (!content) return;

            const username = localStorage.getItem('twister_username') || 'anon';
            const { error } = await supabase.from('posts').insert([{ content, username }]);
            
            if (error) {
                console.error('Error posting:', error);
            } else {
                postContent.value = '';
                await loadFeed();
            }
        });

        await loadFeed();
    }

    // Run Explore page logic
    if (document.getElementById('page-explore')) {
        const exploreResults = document.getElementById('explore-results');
        exploreResults.innerHTML = "<p>Explore functionality is under development.</p>";
    }

    // Run Profile page logic
    if (document.getElementById('page-profile')) {
        const profileInfo = document.getElementById('profile-info');
        const profilePosts = document.getElementById('profile-posts');
        const username = localStorage.getItem('twister_username');

        if (username) {
            profileInfo.innerHTML = `<h2>${username}</h2><p>Viewing your public profile and posts.</p>`;
            
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('username', username)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error loading profile posts:", error);
                profilePosts.innerHTML = "<p>Could not load your posts.</p>";
            } else if (data.length === 0) {
                profilePosts.innerHTML = "<p>You haven't posted anything yet.</p>";
            } else {
                profilePosts.innerHTML = data.map(renderPost).join('');
            }
        } else {
            profileInfo.innerHTML = `<h2>No Profile Set</h2><p>Go to <a href="settings.html">Settings</a> to choose your username.</p>`;
            profilePosts.innerHTML = "";
        }
    }

    // Run Settings page logic
    if (document.getElementById('page-settings')) {
        const settingsForm = document.getElementById('settings-form');
        const usernameInput = document.getElementById('settings-username');

        // Load current username
        usernameInput.value = localStorage.getItem('twister_username') || '';

        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUsername = usernameInput.value.trim();
            if (newUsername) {
                localStorage.setItem('twister_username', newUsername);
                alert(`Username updated to: ${newUsername}`);
            }
        });
    }
});

