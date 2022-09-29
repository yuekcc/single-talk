import { createApp, reactive, nextTick } from 'https://unpkg.com/petite-vue?module';

function formatTimestamp(ts) {
  const d = new Date(parseInt(ts));
  const yyyymmdd = [d.getFullYear(), d.getMonth() + 1, d.getDate()];

  const hhmmss = [d.getHours(), d.getMinutes(), d.getSeconds()];
  return `${yyyymmdd.join('-')} ${hhmmss.join(':')}`;
}

function LoginForm(props = {}) {
  return {
    $template: '#LoginFormComponent',
    username: '',
    password: '',
    requireUsernameAndPassword: false,
    usernameOrPasswordInvalid: false,
    async startLogin() {
      this.usernameOrPasswordInvalid = false;

      if (this.username === '' || this.password === '') {
        this.requireUsernameAndPassword = true;
        return;
      }

      this.requireUsernameAndPassword = false;

      const res = await fetch('/api/login', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      });

      if (res.ok) {
        window.location.href = res.headers.get('location');
        return;
      }

      this.usernameOrPasswordInvalid = true;
    },
  };
}

const messagesStore = reactive({
  list: [],
  update(newVal) {
    this.list = newVal;
  },
});

function SendMessage(props = { messageType: 'text' }) {
  return {
    $template: '#sendMessageTemplate',
    message: '',
    messageType: props.messageType,
    async send() {
      if (!this.message) {
        return;
      }

      const res = await fetch('/api/messages', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: this.message,
          messageType: this.messageType,
          createdTime: Date.now(),
        }),
      });

      if (res.ok) {
        this.load();
        this.message = '';
      }
    },

    async load() {
      const res = await fetch(`/api/messages`);
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = res.headers.get('location');
        }

        return;
      }

      const list = await res.json();
      const updated = list
        .sort((a, b) => parseInt(b.created_time) - parseInt(a.created_time))
        .map(it => {
          return {
            ...it,
            message: it.message || '<N/A>',
            createdTime: formatTimestamp(it.created_time),
          };
        });

      nextTick(() => {
        this.messagesStore.update(updated);
      });
    },
  };
}

function MessageList(props = {}) {
  return {
    $template: '#messageListTemplate',
  };
}

createApp({ LoginForm, SendMessage, MessageList, messagesStore }).mount();
