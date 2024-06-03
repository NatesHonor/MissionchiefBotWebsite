fetch('../web_config.ini')
    .then(response => response.text())
    .then(configIniData => {
        const configLines = configIniData.split('\n');
        const config = {};
        for (const line of configLines) {
            const [key, value] = line.split('=');
            config[key.trim()] = value ? value.trim() : '';
        }
        const configPath = config['config_path'];
        console.log('configPath:', configPath); 
        return fetch(configPath);
    })
    .then(response => response.text())
    .then(configData => {
        document.getElementById('configData').innerText = configData;
    })
    .catch(error => {
        console.error('Error fetching config:', error);
        document.getElementById('configData').innerText = 'Error fetching config';
    });

function redirectToMissionChief() {
    window.location.href = 'https://www.missionchief.com/users/sign_in';
}

function showLoginForm() {
    document.querySelector('.login-form').style.display = 'block';
}

document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    console.log('Form submitted');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Username:', username);
    console.log('Password:', password); 

    try {
        const response = await fetch('/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.text();
            document.querySelector('.center-message').innerText = data;
        } else {
            const errorMessage = await response.text();
            document.querySelector('.center-message').innerText = `Error: ${errorMessage}`;
        }
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.center-message').innerText = `Error: ${error.message}`;
    }
});
