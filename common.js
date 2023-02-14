/*
 * @Author       : lovefc
 * @Date         : 2023-02-14 10:58:01
 * @LastEditTime : 2023-02-14 10:59:35
 */
  var wsCache = new WebStorageCache();
  var msgList = [];
  function say_count(_count) {
    let nextTime = new Date();
    nextTime.setHours(23);
    nextTime.setMinutes(59);
    nextTime.setSeconds(59);
    let say_count = wsCache.get('say_count');
    if (!say_count && say_count != 0) {
      wsCache.set('say_count', _count, { exp: nextTime });
      return true;
    }
    let count = say_count - 1;
    if (count <= 0) {
      return false;
    }
    wsCache.set('say_count', count, { exp: nextTime });
    return true;
  }
  setInterval(function () {
    let arrs = ["你是谁？", "你今年多大？", "你能做什么？", "怎么防止脱发？"];
    let text = arrs[Math.floor(Math.random() * arrs.length)];
    document.getElementById("msg-input").setAttribute("placeholder", text);
  }, 2000);
  const HelloVueApp = {
    data() {
      return {
        key: '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',
        prompt: '',
        temperature: 1,
        top_p: 1,
        max_tokens: 2048,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: ["Human:", "AI:"],
        model: 'text-davinci-003',
        models: ['text-davinci-003', 'text-davinci-002', 'text-curie-001'],
        response: '',
        download_disable: true,
        listMsg: [],
        isShow: false,
        buttonStatus: true,
      }
    },
    created() {
      if (msgList.length == 0) {
        this.chatGptMsg("欢迎使用AI机器人,请提问你的问题！");
      }
    },
    watch: {
      response(resp) {
        if (resp == '') {
          this.download_disable = true;
        } else {
          this.download_disable = false;
        }
      },
      'processData': 'scrollToBottom'
    },
    methods: {
      downloadTxt() {
        let text = 'Prompt: ' + this.prompt + '\n' + document.getElementById('result').innerText;
        let element = document.createElement("a");
        let file = new Blob([text], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "download.txt";
        element.click();
      },
      buttonColor() {
        if (this.buttonStatus === false) {
          return 'background-color: #c8d9e4'
        }
        return 'background-color: #0091e9'
      },
      getTime() {
        return Math.round(new Date().getTime() / 1000).toString();
      },
      // 滚动到下方
      handleScrollBottom() {
        this.$nextTick(() => {
          let scrollElem = this.$refs.scrollDiv;
          scrollElem.scrollTo({ top: scrollElem.scrollHeight, behavior: 'smooth' });
        });
      },
      sendMsg(newList) {
        this.listMsg.push(newList);
        this.handleScrollBottom();
      },
      chatGptMsg(text) {
        let newList = { avatar: 'image/ai.png', msg: text, is_user: 0 };
        this.sendMsg(newList);
      },

      submitForm() {
        if (!this.prompt) {
          let warning = document.getElementById("dream-warning");
          Dreamer.warning("请输入内容！", 1000);
        }
        if (say_count(20) === false) {
          Dreamer.warning("今日使用次数已经用完！", 1000);
        }
        this.buttonStatus = false;
        this.isShow = true;
        let data = {
          prompt: this.prompt,
          temperature: this.temperature,
          top_p: this.top_p,
          model: this.model,
          max_tokens: this.max_tokens,
          frequency_penalty: this.frequency_penalty,
          presence_penalty: this.presence_penalty,
          stop: this.stop
        }
        let newList = { avatar: 'image/user.jpg', msg: this.prompt, is_user: 1, createtime: this.getTime() };
        this.sendMsg(newList);
        axios.post('https://api.openai.com/v1/completions', data, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ` + this.key,
          }
        })
          .then(response => {
            this.isShow = false;
            // 这段显示内容
            this.response = response.data.choices[0].text;
            let newList2 = { avatar: 'image/ai.png', msg: this.response, is_user: 0, createtime: this.getTime() };
            this.sendMsg(newList2);
            this.buttonStatus = true;
          })
          .catch(error => {
            this.isShow = false;
            this.buttonStatus = true;
            Dreamer.warning("机器人暂时出现了一点问题，请刷新后重新提问！", 1000);
          });
      }
    }
  }
  Vue.createApp(HelloVueApp).use(ElementPlus).mount('#hello-vue');
  document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;