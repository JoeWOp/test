// hi
const isGame = () => {
  return window.location.href.startsWith("https://krunker.io/social.html") ? false : true;
}

const waitFor = (test, timeout_ms = Infinity, doWhile = null) => {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  return new Promise(async (resolve, reject) => {
      if (typeof timeout_ms !== 'number') {
          reject('Timeout argument not a number in waitFor(selector, timeout_ms)');
      }
      let result;
      const change = 100;
      while (result === undefined || result === false || result === null || result.length === 0) {
          if (doWhile && doWhile instanceof Function) {
              doWhile();
          }

          if (timeout_ms % 10_000 < change) {
              //waiting
          }
          if ((timeout_ms -= change) < 0) {
              resolve(false);
              return;
          }
          await sleep(change);
          result = typeof test === 'string' ? Function(test)() : test();
      }
    //passed
      resolve(result);
  });
}

window.waitFor = waitFor;


console._error = console.error.bind(this);
let tmpStats = {};
const TYPEOF = value => Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
const NumberSystem = [{
  radix: 2,
  prefix: "0b0*"
}, {
  radix: 8,
  prefix: "0+"
}, {
  radix: 10,
  prefix: ""
}, {
  radix: 16,
  prefix: "0x0*"
}];
class Regex {
  constructor(code, unicode) {
    this.code = code;
    this.COPY_CODE = code;
    this.unicode = unicode || false;
    this.hooks = {};
    this.totalHooks = 0;
  }
  static parseValue(value) {
    try {
      return Function(`return (${value})`)();
    } catch (err) {
      return null;
    }
  }
  isRegexp(value) {
    return TYPEOF(value) === "regexp";
  }
  generateNumberSystem(int) {
    const copy = [...NumberSystem];
    const template = copy.map((({
      prefix,
      radix
    }) => prefix + int.toString(radix)));
    return `(?:${template.join("|")})`;
  }
  parseVariables(regex) {
    regex = regex.replace(/\{VAR\}/g, "(?:let|var|const)");
    regex = regex.replace(/\{QUOTE\}/g, "['\"`]");
    regex = regex.replace(/ARGS\{(\d+)\}/g, ((...args) => {
      let count = Number(args[1]),
        arr = [];
      while (count--) arr.push("\\w+");
      return arr.join("\\s*,\\s*");
    }));
    regex = regex.replace(/NUMBER\{(\d+)\}/g, ((...args) => {
      const int = Number(args[1]);
      return this.generateNumberSystem(int);
    }));
    return regex;
  }
  format(name, inputRegex, flags) {
    this.totalHooks += 1;
    let regex = "";
    if (Array.isArray(inputRegex)) {
      regex = inputRegex.map((exp => this.isRegexp(exp) ? exp.source : exp)).join("\\s*");
    } else if (this.isRegexp(inputRegex)) {
      regex = inputRegex.source;
    }
    regex = this.parseVariables(regex);
    if (this.unicode) {
      regex = regex.replace(/\\w/g, "(?:[^\\x00-\\x7F-]|\\$|\\w)");
    }
    const expression = new RegExp(regex.replace(/\{INSERT\}/, ""), flags);
    const match = this.code.match(expression);
    if (match === null) console._error("failed to find " + name)
    return regex.includes("{INSERT}") ? new RegExp(regex, flags) : expression;
  }
  template(type, name, regex, substr) {
    const expression = new RegExp(`(${this.format(name, regex).source})`);
    const match = this.code.match(expression) || [];
    this.code = this.code.replace(expression, type === 0 ? "$1" + substr : substr + "$1");
    return match;
  }
  match(name, regex, flags, debug = false) {
    const expression = this.format(name, regex, flags);
    const match = this.code.match(expression) || [];
    this.hooks[name] = {
      expression,
      match
    };
    return match;
  }
  matchAll(name, regex, debug = false) {
    const expression = this.format(name, regex, "g");
    const matches = [...this.code.matchAll(expression)];
    this.hooks[name] = {
      expression,
      match: matches
    };
    return matches;
  }
  replace(name, regex, substr, flags) {
    const expression = this.format(name, regex, flags);
    this.code = this.code.replace(expression, substr);
    return this.code.match(expression) || [];
  }
  append(name, regex, substr) {
    return this.template(0, name, regex, substr);
  }
  prepend(name, regex, substr) {
    return this.template(1, name, regex, substr);
  }
  insert(name, regex, substr) {
    const {
      source
    } = this.format(name, regex);
    if (!source.includes("{INSERT}")) throw new Error("Your regexp must contain {INSERT} keyword");
    const findExpression = new RegExp(source.replace(/^(.*)\{INSERT\}(.*)$/, "($1)($2)"));
    this.code = this.code.replace(findExpression, `$1${substr}$2`);
    return this.code.match(findExpression);
  }
}

function applyHooks(code) {
  const Hook = new Regex(code, true);
  window.Hook = Hook;
 // Hook.replace("skyColor", /(Reflect.getOwnPropertyDescriptor\(Object.prototype, {QUOTE}sky{QUOTE}\)\) \{\W+\w{7}\ = ){QUOTE}#ffffff{QUOTE}/, `$1"#121212"`)
 // Hook.replace("dddd", /\w{7}.name.indexOf\('<'\) !\=\= -1 \|\| \w{7}\.name.indexOf\('>'\) !\=\= -1/, "4000 === 23245251")
  /*Hook.append('dwad', /\w{7}\.tmpStats\[\w{7}\]\ = 0;\W+((\w{7})\.tmpStats\[(\w{7})\])\+\+\;/, `if ($4 === 'n') {
 window.updateNukes($3.account.n + $3.tmpStats.n);

  }`);*/
  return Hook.code;
}

let foundIt = false;

const get = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "response")?.get;
Object.defineProperty(XMLHttpRequest.prototype, "response", {
  get() {
    if (this.responseURL === "https://raw.githubusercontent.com/Documantation12/Femboy-krunker-cheat/main/gamefile.js" && foundIt === false) {
      foundIt = true;
      return applyHooks(this.response);
    }
    return get.call(this, arguments);
  }
})

window.updateNukes = (nukes) => {
  localStorage.ttnukes = nukes;
  window.ttnukes = nukes;
}

const waitFor2 = (test, timeout_ms = Infinity, doWhile = null) => {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  return new Promise(async (resolve, reject) => {
    if (typeof timeout_ms !== 'number') {
      reject('Timeout argument not a number in waitFor2(selector, timeout_ms)');
    }
    let result;
    const change = 100;
    while (result === undefined || result === false || result === null || result.length === 0) {
      if (doWhile && doWhile instanceof Function) {
        doWhile();
      }

      if (timeout_ms % 10_000 < change) {
        //waiting
      }
      if ((timeout_ms -= change) < 0) {
        resolve(false);
        return;
      }
      await sleep(change);
      result = typeof test === 'string' ? Function(test)() : test();
    }
    //passed
    resolve(result);
  });
}


let loaded = false;
let keys = new Set();

waitFor2(() => window.logEventFRVR).then(e => {
  const {
    logEventFRVR: logEvent
  } = window;
  window.logEventFRVR = function(type, obj) {
    switch (type) {
      case "account_login": //attempt to login

        break;
      case "account_register": //attempt to register

        break;
      case "session_start": //on successful login

        break;
      case "game_session_start": // when the game starts

        break;
      case "game_session_end": // when the game ends

        break;
      case "game_play_start": // whenever u enter the game with spectator/ or as player

        break;
      case "game_play_end": // whenever you die in the game as a player

        break;
    }
    return logEvent.apply(this, arguments);
  }
})

window.bb = 7;
const getInfo = (which = "1") => {
switch (which) {
case "1":
return {username: "nuketacuIar", password: "1cwqudgmcqw78@"} // alt
break;
case "2":
return {username: "honkhonkalt", password: "d1c2eqwd@4421!!1"} // main | level 80
break;
case "3":
return {username: "bonmai", password: "cd21d/1c!c212@"} // alt
break;
case "4":
return {username: "5atisfied", password: "dce12qwdqw@44"} // alt
break;
case "5":
return {username: "msisi", password: "dc12die22ei@i2"} // level 104 acc
break;
}
}

const login = (which = "1") => {
const info = getInfo(which);
fembot.socket.send && fembot.socket.send("a", 1, [info.username, info.password, null], null)
}
window.addEventListener("keydown", _0x4fd88d => {
  if (isGame()) {
  if (document.activeElement.tagName == "INPUT" || !window.endUI && window.endUI.style.display) {
    return;
  }
  }
  switch (_0x4fd88d.code) {
    case "NumpadSubtract":
      break;
    default:
      if (!keys.has(_0x4fd88d.code)) {
        keys.add(_0x4fd88d.code);
      }
      break;
  }
if(_0x4fd88d.code==="Numpad1") {
login()
} else if (_0x4fd88d.code === "Numpad2") {
login("2")
} else if (_0x4fd88d.code === "Numpad3") {
login("3")
} else if (_0x4fd88d.code === "Numpad4") {
login("4")
}else if (_0x4fd88d.code === "Numpad5") {
login("5")
}
});
window.addEventListener("keyup", _0x46a33a => {
  if (keys.has(_0x46a33a.code)) {
    keys.delete(_0x46a33a.code);
  }
});
window.doThingy2 = false;
let defineddd = false;
document.addEventListener("DOMContentLoaded", e => {
  if (!loaded) {
    loaded = true;
    let dwd = (_0x511e07, _0xf0217d, _0x27628b, _0xa8a465) => {
      return Math.atan2(_0xf0217d - _0xa8a465, _0x511e07 - _0x27628b);
    }
    function reverseAtan(angleInRadians) {
  return angleInRadians * 180 / Math.PI;
}
    waitFor2(() => window.fembot !== undefined).then(e => {
      let a = fembot.inputs;
      Object.defineProperty(fembot.settings, "aimbot", {
        set(val) {
          window.bb = val;
        },
        get() {
          return fembot?.me?.weapon?.name === "Combat Knife" ? 0 : window.bb;
        }
      })
      window.isThingy2 = true;
      window.bytw2 = {};
      fembot.inputs = function(d) {
        /*if (fembot.settings.aimbot === 0 || !fembot.me.active || !d[6]) {
          window.doThingy2 = false;

        } else {
window.isThingy2 = !window.doThingy2;
window.doThingy2 = true;
        }

        if (window.bytw2?.npos) {
          if (!fembot.me.active || !fembot.me?.pos?.x) {
            window.bytw2 = undefined;
          }else
          if (fembot.game.players.list && window.bytw2) {

            const hopefullyTarget = fembot.game.players.list.includes(window.bytw2)
            if (!hopefullyTarget) {
              window.bytw2 = undefined;
            }
          }
        }

        if (!defineddd) {
          defineddd = true;
          Object.defineProperty(fembot.state, "bindAimbotOn", {
            get() {
              if (window.isThingy2 && !window.bytw2) return true;
              return false;
            }
          })
        }*/
        if (keys.has("Space") || fembot.settings.bhop % 2) {
          fembot.controls.keys[fembot.controls.binds.jump.val] ^= 1;
          if (fembot.controls.keys[fembot.controls.binds.jump.val]) {
            fembot.controls.didPressed[fembot.controls.binds.jump.val] = 1;
          }
          if (keys.has("Space") || fembot.settings.bhop == 3) {
            if (fembot.me.velocity.y < -0.03 && fembot.me.canSlide) {
              setTimeout(() => {
                fembot.controls.keys[fembot.controls.binds.crouch.val] = 0;
              }, fembot.me.slideTimer || 325);
              fembot.controls.keys[fembot.controls.binds.crouch.val] = 1;
              fembot.controls.didPressed[fembot.controls.binds.crouch.val] = 1;
            }
          }
        }
        return a.apply(fembot, arguments);
      }
    })
  }
})

const fromLink = (url, raw = false) => {
  const x = new XMLHttpRequest();
  x.open("GET", url, false);
  x.send();
  if (x.status === 200) {
    return raw ? x.response : void(Function(x.response)());
  }
};

isGame() && fromLink("https://raw.githubusercontent.com/Documantation12/Femboy-krunker-cheat/main/Fembot.js");
