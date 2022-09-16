import randomGenerator from 'random-seed'

import ssets from './data/ssets'
import lsets from './data/lsets'
import fsets from './data/fsets'
import vowsets from './data/vowsets'
import consets from './data/consets'
import ressets from './data/ressets'
import corthsets from './data/corthsets'
import vorthsets from './data/vorthsets'
import syllstructs from './data/syllstructs'
import defaultOrtho from './data/defaultOrtho'

function makeLanguage (seed, type) {
  const rand = randomGenerator.create(seed)

  function shuffled(list) {
    var newlist = [];
    for (var i = 0; i < list.length; i++) {
      newlist.push(list[i]);
    }
    for (var i = list.length - 1; i > 0; i--) {
      var tmp = newlist[i];
      var j = randrange(i);
      newlist[i] = newlist[j];
      newlist[j] = tmp;
    }
    return newlist;
  }

  function choose(list, exponent) {
    exponent = exponent || 1;
    return list[Math.floor(Math.pow(rand.random(), exponent) * list.length)];
  }

  function randrange(lo, hi) {
    if (hi == undefined) {
      hi = lo;
      lo = 0;
    }
    return Math.floor(rand.random() * (hi - lo)) + lo;
  }

  function capitalize(word) {
    return word[0].toUpperCase() + word.slice(1);
  }

  function spell(lang, syll) {
    if (lang.noortho) return syll;
    var s = '';
    for (var i = 0; i < syll.length; i++) {
      var c = syll[i];
      s += lang.cortho[c] || lang.vortho[c] || defaultOrtho[c] || c;
    }
    return s;
  }

  function makeSyllable(lang) {
    while (true) {
      var syll = "";
      for (var i = 0; i < lang.structure.length; i++) {
        var ptype = lang.structure[i];
        if (lang.structure[i+1] == '?') {
          i++;
          if (rand.random() < 0.5) {
            continue;
          }
        }
        syll += choose(lang.phonemes[ptype], lang.exponent);
      }
      var bad = false;
      for (var i = 0; i < lang.restricts.length; i++) {
        if (lang.restricts[i].test(syll)) {
          bad = true;
          break;
        }
      }
      if (bad) continue;
      return spell(lang, syll);
    }
  }

  function getMorpheme(lang, key) {
    if (lang.nomorph) {
      return makeSyllable(lang);
    }
    key = key || '';
    var list = lang.morphemes[key] || [];
    var extras = 10;
    if (key) extras = 1;
    while (true) {
      var n = randrange(list.length + extras);
      if (list[n]) return list[n];
      var morph = makeSyllable(lang);
      var bad = false;
      for (var k in lang.morphemes) {
        if (lang.morphemes[k].includes(morph)) {
          bad = true;
          break;
        }
      }
      if (bad) continue;
      list.push(morph);
      lang.morphemes[key] = list;
      return morph;
    }
  }

  function makeWord(lang, key) {
    var nsylls = randrange(lang.minsyll, lang.maxsyll + 1);
    var w = '';
    var keys = [];
    keys[randrange(nsylls)] = key;
    for (var i = 0; i < nsylls; i++) {
      w += getMorpheme(lang, keys[i]);
    }
    return w;
  }

  function getWord(lang, key) {
    key = key || '';
    var ws = lang.words[key] || [];
    var extras = 3;
    if (key) extras = 2;
    while (true) {
      var n = randrange(ws.length + extras);
      var w = ws[n];
      if (w) {
        return w;
      }
      w = makeWord(lang, key);
      var bad = false;
      for (var k in lang.words) {
        if (lang.words[k].includes(w)) {
          bad = true;
          break;
        }
      }
      if (bad) continue;
      ws.push(w);
      lang.words[key] = ws;
      return w;
    }
  }

  function makeName(lang, key) {
    key = key || '';
    lang.genitive = lang.genitive || getMorpheme(lang, 'of');
    lang.definite = lang.definite || getMorpheme(lang, 'the');
    while (true) {
      var name = null;
      if (rand.random() < 0.5) {
        name = capitalize(getWord(lang, key));
      } else {
        var w1 = capitalize(getWord(lang, rand.random() < 0.6 ? key : ''));
        var w2 = capitalize(getWord(lang, rand.random() < 0.6 ? key : ''));
        if (w1 == w2) continue;
        if (rand.random() > 0.5) {
          name = [w1, w2].join(lang.joiner);
        } else {
          name = [w1, lang.genitive, w2].join(lang.joiner);
        }
      }
      if (rand.random() < 0.1) {
        name = [lang.definite, name].join(lang.joiner);
      }

      if ((name.length < lang.minchar) || (name.length > lang.maxchar)) continue;
      var used = false;
      for (var i = 0; i < lang.names.length; i++) {
        var name2 = lang.names[i];
        if ((name.indexOf(name2) != -1) || (name2.indexOf(name) != -1)) {
          used = true;
          break;
        }
      }
      if (used) continue;
      lang.names.push(name);
      return name;
    }
  }

  function makeBasicLanguageDetails() {
    return {
      phonemes: {
        C: "ptkmnls",
        V: "aeiou",
        S: "s",
        F: "mn",
        L: "rl"
      },
      structure: "CVC",
      exponent: 2,
      restricts: [],
      cortho: {},
      vortho: {},
      noortho: true,
      nomorph: true,
      nowordpool: true,
      minsyll: 1,
      maxsyll: 1,
      morphemes: {},
      words: {},
      names: [],
      joiner: ' ',
      maxchar: 12,
      minchar: 5
    };
  }

  function makeOrthoLanguageDetails() {
    var lang = makeBasicLanguageDetails();
    lang.noortho = false;
    return lang;
  }

  function makeRandomLanguageDetails() {
    var lang = makeBasicLanguageDetails();
    lang.noortho = false;
    lang.nomorph = false;
    lang.nowordpool = false;
    lang.phonemes.C = shuffled(choose(consets, 2).C);
    lang.phonemes.V = shuffled(choose(vowsets, 2).V);
    lang.phonemes.L = shuffled(choose(lsets, 2).L);
    lang.phonemes.S = shuffled(choose(ssets, 2).S);
    lang.phonemes.F = shuffled(choose(fsets, 2).F);
    lang.structure = choose(syllstructs);
    lang.restricts = ressets[2].res;
    lang.cortho = choose(corthsets, 2).orth;
    lang.vortho = choose(vorthsets, 2).orth;
    lang.minsyll = randrange(1, 3);
    if (lang.structure.length < 3) lang.minsyll++;
    lang.maxsyll = randrange(lang.minsyll + 1, 7);
    lang.joiner = choose('   -');
    return lang;
  }

  const language = type === 'random'
    ? makeRandomLanguageDetails()
    : type === 'ortho'
    ? makeOrthoLanguageDetails()
    : makeBasicLanguageDetails()

  return {
    makeWord (key) {
      return makeWord(language, key)
    },

    getWord (key) {
      return getWord(language, key)
    },

    makeName (key) {
      return makeName(language, key)
    }
  }
}

export function makeBasicLanguage (seed) {
  return makeLanguage(seed, 'basic')
}

export function makeOrthoLanguage (seed) {
  return makeLanguage(seed, 'ortho')
}

export function makeRandomLanguage (seed) {
  return makeLanguage(seed, 'random')
}
