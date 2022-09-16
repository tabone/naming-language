# Naming language generator

This is code for generating a 'naming language', using the algorithm behind [@unchartedatlas][uncharted]. For more details, see [these notes][notes].

[uncharted]: https://twitter.com/unchartedatlas
[notes]: http://mewo2.com/notes/naming-language/

# Installation

```bash
npm install --save language-generator
```

# Usage

```javascript
  import { makeBasicLanguage } from 'language-generator'

  const language = makeBasicLanguage('seed')
  language.makeWord()   // => tukan
  language.makeName()   // => Na tut Un
  language.getWord()    // => un
```

# Global API

## .makeBasicLanguage([seed:`string`]) => `Language`
## .makeOrthoLanguage([seed:`string`]) => `Language`
## .makeRandomLanguage([seed:`string`]) => `Language`

# `Language` API
## .getWord([key:`string`]) => `string`
## .makeWord([key:`string`]) => `string`
## .makeName([key:`string`]) => `string`
