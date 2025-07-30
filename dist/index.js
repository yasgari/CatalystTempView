var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/@jridgewell/sourcemap-codec/dist/sourcemap-codec.mjs
function decodeInteger(reader, relative) {
  let value = 0;
  let shift = 0;
  let integer2 = 0;
  do {
    const c = reader.next();
    integer2 = charToInt[c];
    value |= (integer2 & 31) << shift;
    shift += 5;
  } while (integer2 & 32);
  const shouldNegate = value & 1;
  value >>>= 1;
  if (shouldNegate) {
    value = -2147483648 | -value;
  }
  return relative + value;
}
function encodeInteger(builder, num, relative) {
  let delta = num - relative;
  delta = delta < 0 ? -delta << 1 | 1 : delta << 1;
  do {
    let clamped = delta & 31;
    delta >>>= 5;
    if (delta > 0)
      clamped |= 32;
    builder.write(intToChar[clamped]);
  } while (delta > 0);
  return num;
}
function hasMoreVlq(reader, max) {
  if (reader.pos >= max)
    return false;
  return reader.peek() !== comma;
}
function decode(mappings) {
  const { length } = mappings;
  const reader = new StringReader(mappings);
  const decoded = [];
  let genColumn = 0;
  let sourcesIndex = 0;
  let sourceLine = 0;
  let sourceColumn = 0;
  let namesIndex = 0;
  do {
    const semi = reader.indexOf(";");
    const line = [];
    let sorted = true;
    let lastCol = 0;
    genColumn = 0;
    while (reader.pos < semi) {
      let seg;
      genColumn = decodeInteger(reader, genColumn);
      if (genColumn < lastCol)
        sorted = false;
      lastCol = genColumn;
      if (hasMoreVlq(reader, semi)) {
        sourcesIndex = decodeInteger(reader, sourcesIndex);
        sourceLine = decodeInteger(reader, sourceLine);
        sourceColumn = decodeInteger(reader, sourceColumn);
        if (hasMoreVlq(reader, semi)) {
          namesIndex = decodeInteger(reader, namesIndex);
          seg = [genColumn, sourcesIndex, sourceLine, sourceColumn, namesIndex];
        } else {
          seg = [genColumn, sourcesIndex, sourceLine, sourceColumn];
        }
      } else {
        seg = [genColumn];
      }
      line.push(seg);
      reader.pos++;
    }
    if (!sorted)
      sort(line);
    decoded.push(line);
    reader.pos = semi + 1;
  } while (reader.pos <= length);
  return decoded;
}
function sort(line) {
  line.sort(sortComparator);
}
function sortComparator(a, b) {
  return a[0] - b[0];
}
function encode(decoded) {
  const writer = new StringWriter();
  let sourcesIndex = 0;
  let sourceLine = 0;
  let sourceColumn = 0;
  let namesIndex = 0;
  for (let i = 0; i < decoded.length; i++) {
    const line = decoded[i];
    if (i > 0)
      writer.write(semicolon);
    if (line.length === 0)
      continue;
    let genColumn = 0;
    for (let j = 0; j < line.length; j++) {
      const segment = line[j];
      if (j > 0)
        writer.write(comma);
      genColumn = encodeInteger(writer, segment[0], genColumn);
      if (segment.length === 1)
        continue;
      sourcesIndex = encodeInteger(writer, segment[1], sourcesIndex);
      sourceLine = encodeInteger(writer, segment[2], sourceLine);
      sourceColumn = encodeInteger(writer, segment[3], sourceColumn);
      if (segment.length === 4)
        continue;
      namesIndex = encodeInteger(writer, segment[4], namesIndex);
    }
  }
  return writer.flush();
}
var comma, semicolon, chars, intToChar, charToInt, bufLength, td, StringWriter, StringReader;
var init_sourcemap_codec = __esm({
  "node_modules/@jridgewell/sourcemap-codec/dist/sourcemap-codec.mjs"() {
    comma = ",".charCodeAt(0);
    semicolon = ";".charCodeAt(0);
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    intToChar = new Uint8Array(64);
    charToInt = new Uint8Array(128);
    for (let i = 0; i < chars.length; i++) {
      const c = chars.charCodeAt(i);
      intToChar[i] = c;
      charToInt[c] = i;
    }
    bufLength = 1024 * 16;
    td = typeof TextDecoder !== "undefined" ? /* @__PURE__ */ new TextDecoder() : typeof Buffer !== "undefined" ? {
      decode(buf) {
        const out = Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
        return out.toString();
      }
    } : {
      decode(buf) {
        let out = "";
        for (let i = 0; i < buf.length; i++) {
          out += String.fromCharCode(buf[i]);
        }
        return out;
      }
    };
    StringWriter = class {
      constructor() {
        this.pos = 0;
        this.out = "";
        this.buffer = new Uint8Array(bufLength);
      }
      write(v) {
        const { buffer } = this;
        buffer[this.pos++] = v;
        if (this.pos === bufLength) {
          this.out += td.decode(buffer);
          this.pos = 0;
        }
      }
      flush() {
        const { buffer, out, pos } = this;
        return pos > 0 ? out + td.decode(buffer.subarray(0, pos)) : out;
      }
    };
    StringReader = class {
      constructor(buffer) {
        this.pos = 0;
        this.buffer = buffer;
      }
      next() {
        return this.buffer.charCodeAt(this.pos++);
      }
      peek() {
        return this.buffer.charCodeAt(this.pos);
      }
      indexOf(char) {
        const { buffer, pos } = this;
        const idx = buffer.indexOf(char, pos);
        return idx === -1 ? buffer.length : idx;
      }
    };
  }
});

// node_modules/magic-string/dist/magic-string.es.mjs
function getBtoa() {
  if (typeof globalThis !== "undefined" && typeof globalThis.btoa === "function") {
    return (str) => globalThis.btoa(unescape(encodeURIComponent(str)));
  } else if (typeof Buffer === "function") {
    return (str) => Buffer.from(str, "utf-8").toString("base64");
  } else {
    return () => {
      throw new Error("Unsupported environment: `window.btoa` or `Buffer` should be supported.");
    };
  }
}
function guessIndent(code) {
  const lines = code.split("\n");
  const tabbed = lines.filter((line) => /^\t+/.test(line));
  const spaced = lines.filter((line) => /^ {2,}/.test(line));
  if (tabbed.length === 0 && spaced.length === 0) {
    return null;
  }
  if (tabbed.length >= spaced.length) {
    return "	";
  }
  const min = spaced.reduce((previous, current) => {
    const numSpaces = /^ +/.exec(current)[0].length;
    return Math.min(numSpaces, previous);
  }, Infinity);
  return new Array(min + 1).join(" ");
}
function getRelativePath(from, to) {
  const fromParts = from.split(/[/\\]/);
  const toParts = to.split(/[/\\]/);
  fromParts.pop();
  while (fromParts[0] === toParts[0]) {
    fromParts.shift();
    toParts.shift();
  }
  if (fromParts.length) {
    let i = fromParts.length;
    while (i--) fromParts[i] = "..";
  }
  return fromParts.concat(toParts).join("/");
}
function isObject(thing) {
  return toString.call(thing) === "[object Object]";
}
function getLocator(source) {
  const originalLines = source.split("\n");
  const lineOffsets = [];
  for (let i = 0, pos = 0; i < originalLines.length; i++) {
    lineOffsets.push(pos);
    pos += originalLines[i].length + 1;
  }
  return function locate(index) {
    let i = 0;
    let j = lineOffsets.length;
    while (i < j) {
      const m = i + j >> 1;
      if (index < lineOffsets[m]) {
        j = m;
      } else {
        i = m + 1;
      }
    }
    const line = i - 1;
    const column = index - lineOffsets[line];
    return { line, column };
  };
}
var BitSet, Chunk, btoa, SourceMap, toString, wordRegex, Mappings, n, warned, MagicString;
var init_magic_string_es = __esm({
  "node_modules/magic-string/dist/magic-string.es.mjs"() {
    init_sourcemap_codec();
    BitSet = class _BitSet {
      constructor(arg) {
        this.bits = arg instanceof _BitSet ? arg.bits.slice() : [];
      }
      add(n2) {
        this.bits[n2 >> 5] |= 1 << (n2 & 31);
      }
      has(n2) {
        return !!(this.bits[n2 >> 5] & 1 << (n2 & 31));
      }
    };
    Chunk = class _Chunk {
      constructor(start, end, content) {
        this.start = start;
        this.end = end;
        this.original = content;
        this.intro = "";
        this.outro = "";
        this.content = content;
        this.storeName = false;
        this.edited = false;
        {
          this.previous = null;
          this.next = null;
        }
      }
      appendLeft(content) {
        this.outro += content;
      }
      appendRight(content) {
        this.intro = this.intro + content;
      }
      clone() {
        const chunk = new _Chunk(this.start, this.end, this.original);
        chunk.intro = this.intro;
        chunk.outro = this.outro;
        chunk.content = this.content;
        chunk.storeName = this.storeName;
        chunk.edited = this.edited;
        return chunk;
      }
      contains(index) {
        return this.start < index && index < this.end;
      }
      eachNext(fn) {
        let chunk = this;
        while (chunk) {
          fn(chunk);
          chunk = chunk.next;
        }
      }
      eachPrevious(fn) {
        let chunk = this;
        while (chunk) {
          fn(chunk);
          chunk = chunk.previous;
        }
      }
      edit(content, storeName, contentOnly) {
        this.content = content;
        if (!contentOnly) {
          this.intro = "";
          this.outro = "";
        }
        this.storeName = storeName;
        this.edited = true;
        return this;
      }
      prependLeft(content) {
        this.outro = content + this.outro;
      }
      prependRight(content) {
        this.intro = content + this.intro;
      }
      reset() {
        this.intro = "";
        this.outro = "";
        if (this.edited) {
          this.content = this.original;
          this.storeName = false;
          this.edited = false;
        }
      }
      split(index) {
        const sliceIndex = index - this.start;
        const originalBefore = this.original.slice(0, sliceIndex);
        const originalAfter = this.original.slice(sliceIndex);
        this.original = originalBefore;
        const newChunk = new _Chunk(index, this.end, originalAfter);
        newChunk.outro = this.outro;
        this.outro = "";
        this.end = index;
        if (this.edited) {
          newChunk.edit("", false);
          this.content = "";
        } else {
          this.content = originalBefore;
        }
        newChunk.next = this.next;
        if (newChunk.next) newChunk.next.previous = newChunk;
        newChunk.previous = this;
        this.next = newChunk;
        return newChunk;
      }
      toString() {
        return this.intro + this.content + this.outro;
      }
      trimEnd(rx) {
        this.outro = this.outro.replace(rx, "");
        if (this.outro.length) return true;
        const trimmed = this.content.replace(rx, "");
        if (trimmed.length) {
          if (trimmed !== this.content) {
            this.split(this.start + trimmed.length).edit("", void 0, true);
            if (this.edited) {
              this.edit(trimmed, this.storeName, true);
            }
          }
          return true;
        } else {
          this.edit("", void 0, true);
          this.intro = this.intro.replace(rx, "");
          if (this.intro.length) return true;
        }
      }
      trimStart(rx) {
        this.intro = this.intro.replace(rx, "");
        if (this.intro.length) return true;
        const trimmed = this.content.replace(rx, "");
        if (trimmed.length) {
          if (trimmed !== this.content) {
            const newChunk = this.split(this.end - trimmed.length);
            if (this.edited) {
              newChunk.edit(trimmed, this.storeName, true);
            }
            this.edit("", void 0, true);
          }
          return true;
        } else {
          this.edit("", void 0, true);
          this.outro = this.outro.replace(rx, "");
          if (this.outro.length) return true;
        }
      }
    };
    btoa = /* @__PURE__ */ getBtoa();
    SourceMap = class {
      constructor(properties) {
        this.version = 3;
        this.file = properties.file;
        this.sources = properties.sources;
        this.sourcesContent = properties.sourcesContent;
        this.names = properties.names;
        this.mappings = encode(properties.mappings);
        if (typeof properties.x_google_ignoreList !== "undefined") {
          this.x_google_ignoreList = properties.x_google_ignoreList;
        }
        if (typeof properties.debugId !== "undefined") {
          this.debugId = properties.debugId;
        }
      }
      toString() {
        return JSON.stringify(this);
      }
      toUrl() {
        return "data:application/json;charset=utf-8;base64," + btoa(this.toString());
      }
    };
    toString = Object.prototype.toString;
    wordRegex = /\w/;
    Mappings = class {
      constructor(hires) {
        this.hires = hires;
        this.generatedCodeLine = 0;
        this.generatedCodeColumn = 0;
        this.raw = [];
        this.rawSegments = this.raw[this.generatedCodeLine] = [];
        this.pending = null;
      }
      addEdit(sourceIndex, content, loc, nameIndex) {
        if (content.length) {
          const contentLengthMinusOne = content.length - 1;
          let contentLineEnd = content.indexOf("\n", 0);
          let previousContentLineEnd = -1;
          while (contentLineEnd >= 0 && contentLengthMinusOne > contentLineEnd) {
            const segment2 = [this.generatedCodeColumn, sourceIndex, loc.line, loc.column];
            if (nameIndex >= 0) {
              segment2.push(nameIndex);
            }
            this.rawSegments.push(segment2);
            this.generatedCodeLine += 1;
            this.raw[this.generatedCodeLine] = this.rawSegments = [];
            this.generatedCodeColumn = 0;
            previousContentLineEnd = contentLineEnd;
            contentLineEnd = content.indexOf("\n", contentLineEnd + 1);
          }
          const segment = [this.generatedCodeColumn, sourceIndex, loc.line, loc.column];
          if (nameIndex >= 0) {
            segment.push(nameIndex);
          }
          this.rawSegments.push(segment);
          this.advance(content.slice(previousContentLineEnd + 1));
        } else if (this.pending) {
          this.rawSegments.push(this.pending);
          this.advance(content);
        }
        this.pending = null;
      }
      addUneditedChunk(sourceIndex, chunk, original, loc, sourcemapLocations) {
        let originalCharIndex = chunk.start;
        let first = true;
        let charInHiresBoundary = false;
        while (originalCharIndex < chunk.end) {
          if (original[originalCharIndex] === "\n") {
            loc.line += 1;
            loc.column = 0;
            this.generatedCodeLine += 1;
            this.raw[this.generatedCodeLine] = this.rawSegments = [];
            this.generatedCodeColumn = 0;
            first = true;
            charInHiresBoundary = false;
          } else {
            if (this.hires || first || sourcemapLocations.has(originalCharIndex)) {
              const segment = [this.generatedCodeColumn, sourceIndex, loc.line, loc.column];
              if (this.hires === "boundary") {
                if (wordRegex.test(original[originalCharIndex])) {
                  if (!charInHiresBoundary) {
                    this.rawSegments.push(segment);
                    charInHiresBoundary = true;
                  }
                } else {
                  this.rawSegments.push(segment);
                  charInHiresBoundary = false;
                }
              } else {
                this.rawSegments.push(segment);
              }
            }
            loc.column += 1;
            this.generatedCodeColumn += 1;
            first = false;
          }
          originalCharIndex += 1;
        }
        this.pending = null;
      }
      advance(str) {
        if (!str) return;
        const lines = str.split("\n");
        if (lines.length > 1) {
          for (let i = 0; i < lines.length - 1; i++) {
            this.generatedCodeLine++;
            this.raw[this.generatedCodeLine] = this.rawSegments = [];
          }
          this.generatedCodeColumn = 0;
        }
        this.generatedCodeColumn += lines[lines.length - 1].length;
      }
    };
    n = "\n";
    warned = {
      insertLeft: false,
      insertRight: false,
      storeName: false
    };
    MagicString = class _MagicString {
      constructor(string, options = {}) {
        const chunk = new Chunk(0, string.length, string);
        Object.defineProperties(this, {
          original: { writable: true, value: string },
          outro: { writable: true, value: "" },
          intro: { writable: true, value: "" },
          firstChunk: { writable: true, value: chunk },
          lastChunk: { writable: true, value: chunk },
          lastSearchedChunk: { writable: true, value: chunk },
          byStart: { writable: true, value: {} },
          byEnd: { writable: true, value: {} },
          filename: { writable: true, value: options.filename },
          indentExclusionRanges: { writable: true, value: options.indentExclusionRanges },
          sourcemapLocations: { writable: true, value: new BitSet() },
          storedNames: { writable: true, value: {} },
          indentStr: { writable: true, value: void 0 },
          ignoreList: { writable: true, value: options.ignoreList },
          offset: { writable: true, value: options.offset || 0 }
        });
        this.byStart[0] = chunk;
        this.byEnd[string.length] = chunk;
      }
      addSourcemapLocation(char) {
        this.sourcemapLocations.add(char);
      }
      append(content) {
        if (typeof content !== "string") throw new TypeError("outro content must be a string");
        this.outro += content;
        return this;
      }
      appendLeft(index, content) {
        index = index + this.offset;
        if (typeof content !== "string") throw new TypeError("inserted content must be a string");
        this._split(index);
        const chunk = this.byEnd[index];
        if (chunk) {
          chunk.appendLeft(content);
        } else {
          this.intro += content;
        }
        return this;
      }
      appendRight(index, content) {
        index = index + this.offset;
        if (typeof content !== "string") throw new TypeError("inserted content must be a string");
        this._split(index);
        const chunk = this.byStart[index];
        if (chunk) {
          chunk.appendRight(content);
        } else {
          this.outro += content;
        }
        return this;
      }
      clone() {
        const cloned = new _MagicString(this.original, { filename: this.filename, offset: this.offset });
        let originalChunk = this.firstChunk;
        let clonedChunk = cloned.firstChunk = cloned.lastSearchedChunk = originalChunk.clone();
        while (originalChunk) {
          cloned.byStart[clonedChunk.start] = clonedChunk;
          cloned.byEnd[clonedChunk.end] = clonedChunk;
          const nextOriginalChunk = originalChunk.next;
          const nextClonedChunk = nextOriginalChunk && nextOriginalChunk.clone();
          if (nextClonedChunk) {
            clonedChunk.next = nextClonedChunk;
            nextClonedChunk.previous = clonedChunk;
            clonedChunk = nextClonedChunk;
          }
          originalChunk = nextOriginalChunk;
        }
        cloned.lastChunk = clonedChunk;
        if (this.indentExclusionRanges) {
          cloned.indentExclusionRanges = this.indentExclusionRanges.slice();
        }
        cloned.sourcemapLocations = new BitSet(this.sourcemapLocations);
        cloned.intro = this.intro;
        cloned.outro = this.outro;
        return cloned;
      }
      generateDecodedMap(options) {
        options = options || {};
        const sourceIndex = 0;
        const names = Object.keys(this.storedNames);
        const mappings = new Mappings(options.hires);
        const locate = getLocator(this.original);
        if (this.intro) {
          mappings.advance(this.intro);
        }
        this.firstChunk.eachNext((chunk) => {
          const loc = locate(chunk.start);
          if (chunk.intro.length) mappings.advance(chunk.intro);
          if (chunk.edited) {
            mappings.addEdit(
              sourceIndex,
              chunk.content,
              loc,
              chunk.storeName ? names.indexOf(chunk.original) : -1
            );
          } else {
            mappings.addUneditedChunk(sourceIndex, chunk, this.original, loc, this.sourcemapLocations);
          }
          if (chunk.outro.length) mappings.advance(chunk.outro);
        });
        return {
          file: options.file ? options.file.split(/[/\\]/).pop() : void 0,
          sources: [
            options.source ? getRelativePath(options.file || "", options.source) : options.file || ""
          ],
          sourcesContent: options.includeContent ? [this.original] : void 0,
          names,
          mappings: mappings.raw,
          x_google_ignoreList: this.ignoreList ? [sourceIndex] : void 0
        };
      }
      generateMap(options) {
        return new SourceMap(this.generateDecodedMap(options));
      }
      _ensureindentStr() {
        if (this.indentStr === void 0) {
          this.indentStr = guessIndent(this.original);
        }
      }
      _getRawIndentString() {
        this._ensureindentStr();
        return this.indentStr;
      }
      getIndentString() {
        this._ensureindentStr();
        return this.indentStr === null ? "	" : this.indentStr;
      }
      indent(indentStr, options) {
        const pattern = /^[^\r\n]/gm;
        if (isObject(indentStr)) {
          options = indentStr;
          indentStr = void 0;
        }
        if (indentStr === void 0) {
          this._ensureindentStr();
          indentStr = this.indentStr || "	";
        }
        if (indentStr === "") return this;
        options = options || {};
        const isExcluded = {};
        if (options.exclude) {
          const exclusions = typeof options.exclude[0] === "number" ? [options.exclude] : options.exclude;
          exclusions.forEach((exclusion) => {
            for (let i = exclusion[0]; i < exclusion[1]; i += 1) {
              isExcluded[i] = true;
            }
          });
        }
        let shouldIndentNextCharacter = options.indentStart !== false;
        const replacer = (match) => {
          if (shouldIndentNextCharacter) return `${indentStr}${match}`;
          shouldIndentNextCharacter = true;
          return match;
        };
        this.intro = this.intro.replace(pattern, replacer);
        let charIndex = 0;
        let chunk = this.firstChunk;
        while (chunk) {
          const end = chunk.end;
          if (chunk.edited) {
            if (!isExcluded[charIndex]) {
              chunk.content = chunk.content.replace(pattern, replacer);
              if (chunk.content.length) {
                shouldIndentNextCharacter = chunk.content[chunk.content.length - 1] === "\n";
              }
            }
          } else {
            charIndex = chunk.start;
            while (charIndex < end) {
              if (!isExcluded[charIndex]) {
                const char = this.original[charIndex];
                if (char === "\n") {
                  shouldIndentNextCharacter = true;
                } else if (char !== "\r" && shouldIndentNextCharacter) {
                  shouldIndentNextCharacter = false;
                  if (charIndex === chunk.start) {
                    chunk.prependRight(indentStr);
                  } else {
                    this._splitChunk(chunk, charIndex);
                    chunk = chunk.next;
                    chunk.prependRight(indentStr);
                  }
                }
              }
              charIndex += 1;
            }
          }
          charIndex = chunk.end;
          chunk = chunk.next;
        }
        this.outro = this.outro.replace(pattern, replacer);
        return this;
      }
      insert() {
        throw new Error(
          "magicString.insert(...) is deprecated. Use prependRight(...) or appendLeft(...)"
        );
      }
      insertLeft(index, content) {
        if (!warned.insertLeft) {
          console.warn(
            "magicString.insertLeft(...) is deprecated. Use magicString.appendLeft(...) instead"
          );
          warned.insertLeft = true;
        }
        return this.appendLeft(index, content);
      }
      insertRight(index, content) {
        if (!warned.insertRight) {
          console.warn(
            "magicString.insertRight(...) is deprecated. Use magicString.prependRight(...) instead"
          );
          warned.insertRight = true;
        }
        return this.prependRight(index, content);
      }
      move(start, end, index) {
        start = start + this.offset;
        end = end + this.offset;
        index = index + this.offset;
        if (index >= start && index <= end) throw new Error("Cannot move a selection inside itself");
        this._split(start);
        this._split(end);
        this._split(index);
        const first = this.byStart[start];
        const last = this.byEnd[end];
        const oldLeft = first.previous;
        const oldRight = last.next;
        const newRight = this.byStart[index];
        if (!newRight && last === this.lastChunk) return this;
        const newLeft = newRight ? newRight.previous : this.lastChunk;
        if (oldLeft) oldLeft.next = oldRight;
        if (oldRight) oldRight.previous = oldLeft;
        if (newLeft) newLeft.next = first;
        if (newRight) newRight.previous = last;
        if (!first.previous) this.firstChunk = last.next;
        if (!last.next) {
          this.lastChunk = first.previous;
          this.lastChunk.next = null;
        }
        first.previous = newLeft;
        last.next = newRight || null;
        if (!newLeft) this.firstChunk = first;
        if (!newRight) this.lastChunk = last;
        return this;
      }
      overwrite(start, end, content, options) {
        options = options || {};
        return this.update(start, end, content, { ...options, overwrite: !options.contentOnly });
      }
      update(start, end, content, options) {
        start = start + this.offset;
        end = end + this.offset;
        if (typeof content !== "string") throw new TypeError("replacement content must be a string");
        if (this.original.length !== 0) {
          while (start < 0) start += this.original.length;
          while (end < 0) end += this.original.length;
        }
        if (end > this.original.length) throw new Error("end is out of bounds");
        if (start === end)
          throw new Error(
            "Cannot overwrite a zero-length range \u2013 use appendLeft or prependRight instead"
          );
        this._split(start);
        this._split(end);
        if (options === true) {
          if (!warned.storeName) {
            console.warn(
              "The final argument to magicString.overwrite(...) should be an options object. See https://github.com/rich-harris/magic-string"
            );
            warned.storeName = true;
          }
          options = { storeName: true };
        }
        const storeName = options !== void 0 ? options.storeName : false;
        const overwrite = options !== void 0 ? options.overwrite : false;
        if (storeName) {
          const original = this.original.slice(start, end);
          Object.defineProperty(this.storedNames, original, {
            writable: true,
            value: true,
            enumerable: true
          });
        }
        const first = this.byStart[start];
        const last = this.byEnd[end];
        if (first) {
          let chunk = first;
          while (chunk !== last) {
            if (chunk.next !== this.byStart[chunk.end]) {
              throw new Error("Cannot overwrite across a split point");
            }
            chunk = chunk.next;
            chunk.edit("", false);
          }
          first.edit(content, storeName, !overwrite);
        } else {
          const newChunk = new Chunk(start, end, "").edit(content, storeName);
          last.next = newChunk;
          newChunk.previous = last;
        }
        return this;
      }
      prepend(content) {
        if (typeof content !== "string") throw new TypeError("outro content must be a string");
        this.intro = content + this.intro;
        return this;
      }
      prependLeft(index, content) {
        index = index + this.offset;
        if (typeof content !== "string") throw new TypeError("inserted content must be a string");
        this._split(index);
        const chunk = this.byEnd[index];
        if (chunk) {
          chunk.prependLeft(content);
        } else {
          this.intro = content + this.intro;
        }
        return this;
      }
      prependRight(index, content) {
        index = index + this.offset;
        if (typeof content !== "string") throw new TypeError("inserted content must be a string");
        this._split(index);
        const chunk = this.byStart[index];
        if (chunk) {
          chunk.prependRight(content);
        } else {
          this.outro = content + this.outro;
        }
        return this;
      }
      remove(start, end) {
        start = start + this.offset;
        end = end + this.offset;
        if (this.original.length !== 0) {
          while (start < 0) start += this.original.length;
          while (end < 0) end += this.original.length;
        }
        if (start === end) return this;
        if (start < 0 || end > this.original.length) throw new Error("Character is out of bounds");
        if (start > end) throw new Error("end must be greater than start");
        this._split(start);
        this._split(end);
        let chunk = this.byStart[start];
        while (chunk) {
          chunk.intro = "";
          chunk.outro = "";
          chunk.edit("");
          chunk = end > chunk.end ? this.byStart[chunk.end] : null;
        }
        return this;
      }
      reset(start, end) {
        start = start + this.offset;
        end = end + this.offset;
        if (this.original.length !== 0) {
          while (start < 0) start += this.original.length;
          while (end < 0) end += this.original.length;
        }
        if (start === end) return this;
        if (start < 0 || end > this.original.length) throw new Error("Character is out of bounds");
        if (start > end) throw new Error("end must be greater than start");
        this._split(start);
        this._split(end);
        let chunk = this.byStart[start];
        while (chunk) {
          chunk.reset();
          chunk = end > chunk.end ? this.byStart[chunk.end] : null;
        }
        return this;
      }
      lastChar() {
        if (this.outro.length) return this.outro[this.outro.length - 1];
        let chunk = this.lastChunk;
        do {
          if (chunk.outro.length) return chunk.outro[chunk.outro.length - 1];
          if (chunk.content.length) return chunk.content[chunk.content.length - 1];
          if (chunk.intro.length) return chunk.intro[chunk.intro.length - 1];
        } while (chunk = chunk.previous);
        if (this.intro.length) return this.intro[this.intro.length - 1];
        return "";
      }
      lastLine() {
        let lineIndex = this.outro.lastIndexOf(n);
        if (lineIndex !== -1) return this.outro.substr(lineIndex + 1);
        let lineStr = this.outro;
        let chunk = this.lastChunk;
        do {
          if (chunk.outro.length > 0) {
            lineIndex = chunk.outro.lastIndexOf(n);
            if (lineIndex !== -1) return chunk.outro.substr(lineIndex + 1) + lineStr;
            lineStr = chunk.outro + lineStr;
          }
          if (chunk.content.length > 0) {
            lineIndex = chunk.content.lastIndexOf(n);
            if (lineIndex !== -1) return chunk.content.substr(lineIndex + 1) + lineStr;
            lineStr = chunk.content + lineStr;
          }
          if (chunk.intro.length > 0) {
            lineIndex = chunk.intro.lastIndexOf(n);
            if (lineIndex !== -1) return chunk.intro.substr(lineIndex + 1) + lineStr;
            lineStr = chunk.intro + lineStr;
          }
        } while (chunk = chunk.previous);
        lineIndex = this.intro.lastIndexOf(n);
        if (lineIndex !== -1) return this.intro.substr(lineIndex + 1) + lineStr;
        return this.intro + lineStr;
      }
      slice(start = 0, end = this.original.length - this.offset) {
        start = start + this.offset;
        end = end + this.offset;
        if (this.original.length !== 0) {
          while (start < 0) start += this.original.length;
          while (end < 0) end += this.original.length;
        }
        let result = "";
        let chunk = this.firstChunk;
        while (chunk && (chunk.start > start || chunk.end <= start)) {
          if (chunk.start < end && chunk.end >= end) {
            return result;
          }
          chunk = chunk.next;
        }
        if (chunk && chunk.edited && chunk.start !== start)
          throw new Error(`Cannot use replaced character ${start} as slice start anchor.`);
        const startChunk = chunk;
        while (chunk) {
          if (chunk.intro && (startChunk !== chunk || chunk.start === start)) {
            result += chunk.intro;
          }
          const containsEnd = chunk.start < end && chunk.end >= end;
          if (containsEnd && chunk.edited && chunk.end !== end)
            throw new Error(`Cannot use replaced character ${end} as slice end anchor.`);
          const sliceStart = startChunk === chunk ? start - chunk.start : 0;
          const sliceEnd = containsEnd ? chunk.content.length + end - chunk.end : chunk.content.length;
          result += chunk.content.slice(sliceStart, sliceEnd);
          if (chunk.outro && (!containsEnd || chunk.end === end)) {
            result += chunk.outro;
          }
          if (containsEnd) {
            break;
          }
          chunk = chunk.next;
        }
        return result;
      }
      // TODO deprecate this? not really very useful
      snip(start, end) {
        const clone = this.clone();
        clone.remove(0, start);
        clone.remove(end, clone.original.length);
        return clone;
      }
      _split(index) {
        if (this.byStart[index] || this.byEnd[index]) return;
        let chunk = this.lastSearchedChunk;
        const searchForward = index > chunk.end;
        while (chunk) {
          if (chunk.contains(index)) return this._splitChunk(chunk, index);
          chunk = searchForward ? this.byStart[chunk.end] : this.byEnd[chunk.start];
        }
      }
      _splitChunk(chunk, index) {
        if (chunk.edited && chunk.content.length) {
          const loc = getLocator(this.original)(index);
          throw new Error(
            `Cannot split a chunk that has already been edited (${loc.line}:${loc.column} \u2013 "${chunk.original}")`
          );
        }
        const newChunk = chunk.split(index);
        this.byEnd[index] = chunk;
        this.byStart[index] = newChunk;
        this.byEnd[newChunk.end] = newChunk;
        if (chunk === this.lastChunk) this.lastChunk = newChunk;
        this.lastSearchedChunk = chunk;
        return true;
      }
      toString() {
        let str = this.intro;
        let chunk = this.firstChunk;
        while (chunk) {
          str += chunk.toString();
          chunk = chunk.next;
        }
        return str + this.outro;
      }
      isEmpty() {
        let chunk = this.firstChunk;
        do {
          if (chunk.intro.length && chunk.intro.trim() || chunk.content.length && chunk.content.trim() || chunk.outro.length && chunk.outro.trim())
            return false;
        } while (chunk = chunk.next);
        return true;
      }
      length() {
        let chunk = this.firstChunk;
        let length = 0;
        do {
          length += chunk.intro.length + chunk.content.length + chunk.outro.length;
        } while (chunk = chunk.next);
        return length;
      }
      trimLines() {
        return this.trim("[\\r\\n]");
      }
      trim(charType) {
        return this.trimStart(charType).trimEnd(charType);
      }
      trimEndAborted(charType) {
        const rx = new RegExp((charType || "\\s") + "+$");
        this.outro = this.outro.replace(rx, "");
        if (this.outro.length) return true;
        let chunk = this.lastChunk;
        do {
          const end = chunk.end;
          const aborted = chunk.trimEnd(rx);
          if (chunk.end !== end) {
            if (this.lastChunk === chunk) {
              this.lastChunk = chunk.next;
            }
            this.byEnd[chunk.end] = chunk;
            this.byStart[chunk.next.start] = chunk.next;
            this.byEnd[chunk.next.end] = chunk.next;
          }
          if (aborted) return true;
          chunk = chunk.previous;
        } while (chunk);
        return false;
      }
      trimEnd(charType) {
        this.trimEndAborted(charType);
        return this;
      }
      trimStartAborted(charType) {
        const rx = new RegExp("^" + (charType || "\\s") + "+");
        this.intro = this.intro.replace(rx, "");
        if (this.intro.length) return true;
        let chunk = this.firstChunk;
        do {
          const end = chunk.end;
          const aborted = chunk.trimStart(rx);
          if (chunk.end !== end) {
            if (chunk === this.lastChunk) this.lastChunk = chunk.next;
            this.byEnd[chunk.end] = chunk;
            this.byStart[chunk.next.start] = chunk.next;
            this.byEnd[chunk.next.end] = chunk.next;
          }
          if (aborted) return true;
          chunk = chunk.next;
        } while (chunk);
        return false;
      }
      trimStart(charType) {
        this.trimStartAborted(charType);
        return this;
      }
      hasChanged() {
        return this.original !== this.toString();
      }
      _replaceRegexp(searchValue, replacement) {
        function getReplacement(match, str) {
          if (typeof replacement === "string") {
            return replacement.replace(/\$(\$|&|\d+)/g, (_, i) => {
              if (i === "$") return "$";
              if (i === "&") return match[0];
              const num = +i;
              if (num < match.length) return match[+i];
              return `$${i}`;
            });
          } else {
            return replacement(...match, match.index, str, match.groups);
          }
        }
        function matchAll(re, str) {
          let match;
          const matches = [];
          while (match = re.exec(str)) {
            matches.push(match);
          }
          return matches;
        }
        if (searchValue.global) {
          const matches = matchAll(searchValue, this.original);
          matches.forEach((match) => {
            if (match.index != null) {
              const replacement2 = getReplacement(match, this.original);
              if (replacement2 !== match[0]) {
                this.overwrite(match.index, match.index + match[0].length, replacement2);
              }
            }
          });
        } else {
          const match = this.original.match(searchValue);
          if (match && match.index != null) {
            const replacement2 = getReplacement(match, this.original);
            if (replacement2 !== match[0]) {
              this.overwrite(match.index, match.index + match[0].length, replacement2);
            }
          }
        }
        return this;
      }
      _replaceString(string, replacement) {
        const { original } = this;
        const index = original.indexOf(string);
        if (index !== -1) {
          this.overwrite(index, index + string.length, replacement);
        }
        return this;
      }
      replace(searchValue, replacement) {
        if (typeof searchValue === "string") {
          return this._replaceString(searchValue, replacement);
        }
        return this._replaceRegexp(searchValue, replacement);
      }
      _replaceAllString(string, replacement) {
        const { original } = this;
        const stringLength = string.length;
        for (let index = original.indexOf(string); index !== -1; index = original.indexOf(string, index + stringLength)) {
          const previous = original.slice(index, index + stringLength);
          if (previous !== replacement) this.overwrite(index, index + stringLength, replacement);
        }
        return this;
      }
      replaceAll(searchValue, replacement) {
        if (typeof searchValue === "string") {
          return this._replaceAllString(searchValue, replacement);
        }
        if (!searchValue.global) {
          throw new TypeError(
            "MagicString.prototype.replaceAll called with a non-global RegExp argument"
          );
        }
        return this._replaceRegexp(searchValue, replacement);
      }
    };
  }
});

// node_modules/@replit/vite-plugin-cartographer/dist/index.mjs
var dist_exports = {};
__export(dist_exports, {
  cartographer: () => cartographer,
  version: () => version
});
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "@babel/parser";
function cartographer() {
  let clientScript;
  let configuredRoot;
  let configuredRootName;
  return {
    name: "@replit/vite-plugin-cartographer",
    enforce: "pre",
    async configResolved(config) {
      configuredRoot = config.root;
      configuredRootName = path.basename(configuredRoot);
      const currentFileUrl = typeof __dirname === "string" ? path.join(__dirname, "../dist/beacon/index.global.js") : fileURLToPath(
        new URL("../dist/beacon/index.global.js", import.meta.url)
      );
      try {
        clientScript = await fs.readFile(currentFileUrl, "utf-8");
      } catch (error) {
        console.error(
          "[replit-cartographer] Failed to load client script:",
          error
        );
      }
    },
    resolveId(_source, _importer) {
      return null;
    },
    async transform(code, id) {
      if (!validExtensions.has(path.extname(id)) || id.includes("node_modules")) {
        return null;
      }
      try {
        const ast = parse(code, {
          sourceType: "module",
          plugins: ["jsx", "typescript"]
        });
        const magicString = new MagicString(code);
        let currentElement = null;
        const traverse = await import("@babel/traverse").then((m) => m.default);
        traverse(ast, {
          JSXElement: {
            enter(elementPath) {
              currentElement = elementPath.node;
            },
            exit() {
              currentElement = null;
            }
          },
          JSXOpeningElement(elementPath) {
            if (currentElement) {
              const jsxNode = elementPath.node;
              const elementName = getElementName(jsxNode);
              if (!elementName) {
                return;
              }
              const { line = 0, column: col = 0 } = jsxNode.loc?.start ?? {};
              const relativeToConfigured = path.relative(configuredRoot, id);
              const componentPath = path.join(
                configuredRootName,
                relativeToConfigured
              );
              const componentMetadata = col === 0 ? `${componentPath}:${line}` : `${componentPath}:${line}:${col}`;
              magicString.appendLeft(
                jsxNode.name.end ?? 0,
                ` ${DATA_ATTRIBUTES.METADATA}="${componentMetadata}" ${DATA_ATTRIBUTES.COMPONENT_NAME}="${elementName}"`
              );
            }
          }
        });
        return {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true })
        };
      } catch (error) {
        console.error(`[replit-cartographer] Error processing ${id}:`, error);
        return null;
      }
    },
    transformIndexHtml() {
      if (!clientScript) {
        return [];
      }
      return [
        {
          tag: "script",
          attrs: { type: "module" },
          children: clientScript,
          injectTo: "head"
        }
      ];
    }
  };
}
function getElementName(jsxNode) {
  if (jsxNode.name.type === "JSXIdentifier") {
    return jsxNode.name.name;
  }
  if (jsxNode.name.type === "JSXMemberExpression") {
    const memberExpr = jsxNode.name;
    const object = memberExpr.object;
    const property = memberExpr.property;
    return `${object.name}.${property.name}`;
  }
  return null;
}
var DATA_ATTRIBUTES, validExtensions, version;
var init_dist = __esm({
  "node_modules/@replit/vite-plugin-cartographer/dist/index.mjs"() {
    init_magic_string_es();
    DATA_ATTRIBUTES = {
      METADATA: "data-replit-metadata",
      COMPONENT_NAME: "data-component-name"
    };
    validExtensions = /* @__PURE__ */ new Set([".jsx", ".tsx"]);
    version = "0.2.8";
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";

// server/catalyst-center-api.ts
import https from "https";
var CatalystCenterAPI = class {
  baseUrl;
  username;
  password;
  authToken = null;
  constructor() {
    this.baseUrl = process.env.CATALYST_CENTER_BASE_URL || "";
    this.username = process.env.CATALYST_CENTER_USERNAME || "";
    this.password = process.env.CATALYST_CENTER_PASSWORD || "";
    console.log("Catalyst Center Configuration:", {
      baseUrl: this.baseUrl ? "SET" : "NOT SET",
      username: this.username ? "SET" : "NOT SET",
      password: this.password ? "SET" : "NOT SET"
    });
  }
  isConfigured() {
    return !!(this.baseUrl && this.username && this.password);
  }
  async authenticate() {
    if (!this.isConfigured()) {
      throw new Error(`Catalyst Center credentials not configured. Base URL: ${this.baseUrl}, Username: ${this.username ? "SET" : "NOT SET"}, Password: ${this.password ? "SET" : "NOT SET"}`);
    }
    if (this.authToken && this.authToken.expiresAt > Date.now()) {
      return this.authToken.token;
    }
    try {
      new URL(this.baseUrl);
    } catch (error) {
      throw new Error(`Invalid base URL format: ${this.baseUrl}`);
    }
    return new Promise((resolve3, reject) => {
      const authData = JSON.stringify({
        username: this.username,
        password: this.password
      });
      const url = new URL(this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: "/dna/system/api/v1/auth/token",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(authData),
          "Authorization": `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`
        },
        rejectUnauthorized: false
        // For self-signed certificates
      };
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            if (res.statusCode === 200) {
              const response = JSON.parse(data);
              const token = response.Token;
              this.authToken = {
                token,
                expiresAt: Date.now() + 55 * 60 * 1e3
                // 55 minutes to be safe
              };
              resolve3(token);
            } else {
              reject(new Error(`Authentication failed: ${res.statusCode} ${data}`));
            }
          } catch (error) {
            reject(new Error(`Authentication response parsing failed: ${error}`));
          }
        });
      });
      req.on("error", (error) => {
        reject(new Error(`Authentication request failed: ${error.message}`));
      });
      req.write(authData);
      req.end();
    });
  }
  async makeAuthenticatedRequest(path4) {
    const token = await this.authenticate();
    return new Promise((resolve3, reject) => {
      const url = new URL(this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: path4,
        method: "GET",
        headers: {
          "X-Auth-Token": token,
          "Content-Type": "application/json"
        },
        rejectUnauthorized: false
      };
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            if (res.statusCode === 200) {
              resolve3(JSON.parse(data));
            } else {
              reject(new Error(`API request failed: ${res.statusCode} ${data}`));
            }
          } catch (error) {
            reject(new Error(`Response parsing failed: ${error}`));
          }
        });
      });
      req.on("error", (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });
      req.end();
    });
  }
  async getDeviceHealth() {
    if (!this.isConfigured()) {
      console.warn("Catalyst Center not configured, using fallback data");
      return [];
    }
    try {
      const response = await this.makeAuthenticatedRequest("/dna/intent/api/v1/device-health");
      return response.response || [];
    } catch (error) {
      console.error("Failed to fetch device health from Catalyst Center:", error);
      throw error;
    }
  }
  mapDeviceToSwitch(device) {
    let temperature = 25;
    if (device.temperature) {
      const tempMatch = device.temperature.toString().match(/(\d+\.?\d*)/);
      if (tempMatch) {
        temperature = parseFloat(tempMatch[1]);
        if (temperature < 0 || temperature > 100) {
          temperature = 25;
        }
      }
    }
    if (temperature === 25 && device.overallHealth) {
      temperature = 20 + device.overallHealth * 4;
    }
    let switchType = "access";
    if (device.series?.toLowerCase().includes("9500") || device.role?.toLowerCase().includes("core")) {
      switchType = "core";
    } else if (device.series?.toLowerCase().includes("9400") || device.role?.toLowerCase().includes("distribution")) {
      switchType = "distribution";
    }
    const locationParts = device.locationName?.split("/") || ["Unknown"];
    const site = locationParts[0]?.toLowerCase().replace(/\s+/g, "") || "unknown";
    const location = device.locationName || device.snmpLocation || "Unknown Location";
    return {
      id: device.id,
      name: device.hostname || `Switch-${device.id.slice(-6)}`,
      model: device.platformId || "Unknown Model",
      location,
      rack: device.snmpLocation || null,
      site,
      switchType,
      currentTemperature: temperature,
      isOnline: device.collectionStatus === "Managed" && device.overallHealth > 0,
      lastUpdate: new Date(device.lastUpdateTime || Date.now())
    };
  }
  async getSwitches() {
    try {
      const devices = await this.getDeviceHealth();
      const switches2 = devices.filter((device) => {
        const type = device.type?.toLowerCase() || "";
        const family = device.family?.toLowerCase() || "";
        const platformId = device.platformId?.toLowerCase() || "";
        return type.includes("switch") || family.includes("switch") || platformId.includes("catalyst") || platformId.includes("9300") || platformId.includes("9400") || platformId.includes("9500");
      }).map((device) => this.mapDeviceToSwitch(device));
      return switches2;
    } catch (error) {
      console.error("Failed to get switches from Catalyst Center:", error);
      return [];
    }
  }
  async refreshDeviceData() {
    try {
      const switches2 = await this.getSwitches();
      return {
        success: true,
        message: `Successfully refreshed data for ${switches2.length} switches`,
        switchCount: switches2.length
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to refresh device data: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
};
var catalystCenterAPI = new CatalystCenterAPI();

// server/storage.ts
var MemStorage = class {
  switches;
  temperatureReadings;
  constructor() {
    this.switches = /* @__PURE__ */ new Map();
    this.temperatureReadings = /* @__PURE__ */ new Map();
    this.initializeMockData();
  }
  initializeMockData() {
    const mockSwitches = [
      {
        id: "sw-hq-001",
        name: "SW-HQ-001",
        model: "Catalyst 9300-48T",
        location: "Building A, Floor 2",
        rack: "Rack 4, U12",
        site: "hq",
        switchType: "access",
        currentTemperature: 38.2,
        isOnline: true
      },
      {
        id: "sw-dc-005",
        name: "SW-DC-005",
        model: "Catalyst 9500-48Y4C",
        location: "Data Center",
        rack: "Rack 12, U18",
        site: "datacenter",
        switchType: "core",
        currentTemperature: 52.8,
        isOnline: true
      },
      {
        id: "sw-br1-003",
        name: "SW-BR1-003",
        model: "Catalyst 9300-24T",
        location: "Branch 1",
        rack: "Server Room, Wall Mount",
        site: "branch1",
        switchType: "access",
        currentTemperature: 67.1,
        isOnline: true
      },
      {
        id: "sw-hq-012",
        name: "SW-HQ-012",
        model: "Catalyst 9300-48T",
        location: "Building B, Floor 1",
        rack: "Rack 8, U6",
        site: "hq",
        switchType: "access",
        currentTemperature: 34.5,
        isOnline: true
      },
      // Add more switches for demo
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `sw-auto-${i + 5}`,
        name: `SW-AUTO-${String(i + 5).padStart(3, "0")}`,
        model: i % 3 === 0 ? "Catalyst 9300-24T" : i % 3 === 1 ? "Catalyst 9300-48T" : "Catalyst 9500-48Y4C",
        location: `Building ${String.fromCharCode(65 + i % 4)}, Floor ${i % 3 + 1}`,
        rack: `Rack ${i % 10 + 1}, U${i % 20 + 1}`,
        site: ["hq", "branch1", "branch2", "datacenter"][i % 4],
        switchType: ["access", "distribution", "core"][i % 3],
        currentTemperature: 25 + Math.random() * 45,
        // 25-70°C range
        isOnline: Math.random() > 0.1
        // 90% online
      }))
    ];
    mockSwitches.forEach((switchData) => {
      const switchWithTimestamp = {
        ...switchData,
        lastUpdate: /* @__PURE__ */ new Date()
      };
      this.switches.set(switchData.id, switchWithTimestamp);
    });
    this.generateHistoricalData();
  }
  generateHistoricalData() {
    const now = /* @__PURE__ */ new Date();
    const switches2 = Array.from(this.switches.values());
    switches2.forEach((switchItem) => {
      for (let i = 24; i >= 0; i--) {
        const timestamp2 = new Date(now.getTime() - i * 60 * 60 * 1e3);
        const baseTemp = switchItem.currentTemperature;
        const variation = (Math.random() - 0.5) * 10;
        const temperature = Math.max(20, Math.min(80, baseTemp + variation));
        const reading = {
          id: randomUUID(),
          switchId: switchItem.id,
          temperature,
          timestamp: timestamp2
        };
        this.temperatureReadings.set(reading.id, reading);
      }
    });
  }
  async getSwitches() {
    try {
      const realSwitches = await catalystCenterAPI.getSwitches();
      if (realSwitches.length > 0) {
        this.switches.clear();
        realSwitches.forEach((switchData) => {
          this.switches.set(switchData.id, switchData);
        });
        return realSwitches;
      }
    } catch (error) {
      console.warn("Using fallback mock data due to Catalyst Center API error:", error);
    }
    return Array.from(this.switches.values());
  }
  async getSwitch(id) {
    return this.switches.get(id);
  }
  async createSwitch(switchData) {
    const id = randomUUID();
    const newSwitch = {
      ...switchData,
      id,
      lastUpdate: /* @__PURE__ */ new Date()
    };
    this.switches.set(id, newSwitch);
    return newSwitch;
  }
  async updateSwitchTemperature(id, temperature) {
    const existingSwitch = this.switches.get(id);
    if (!existingSwitch) return void 0;
    const updatedSwitch = {
      ...existingSwitch,
      currentTemperature: temperature,
      lastUpdate: /* @__PURE__ */ new Date()
    };
    this.switches.set(id, updatedSwitch);
    await this.createTemperatureReading({
      switchId: id,
      temperature
    });
    return updatedSwitch;
  }
  async getTemperatureReadings(switchId, limit) {
    let readings = Array.from(this.temperatureReadings.values());
    if (switchId) {
      readings = readings.filter((r) => r.switchId === switchId);
    }
    readings.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
    if (limit) {
      readings = readings.slice(0, limit);
    }
    return readings;
  }
  async createTemperatureReading(reading) {
    const id = randomUUID();
    const newReading = {
      ...reading,
      id,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.temperatureReadings.set(id, newReading);
    return newReading;
  }
  async getDashboardStats() {
    const switches2 = Array.from(this.switches.values());
    const totalSwitches = switches2.length;
    const onlineSwitches = switches2.filter((s) => s.isOnline).length;
    const alertCount = switches2.filter((s) => s.currentTemperature > 45).length;
    const avgTemperature = switches2.reduce((sum, s) => sum + s.currentTemperature, 0) / totalSwitches;
    return {
      totalSwitches,
      onlineSwitches,
      alertCount,
      avgTemperature: Math.round(avgTemperature * 10) / 10
    };
  }
  async getTemperatureDistribution() {
    const switches2 = Array.from(this.switches.values()).filter((s) => s.isOnline);
    const normal = switches2.filter((s) => s.currentTemperature >= 20 && s.currentTemperature <= 45).length;
    const warning = switches2.filter((s) => s.currentTemperature > 45 && s.currentTemperature <= 60).length;
    const critical = switches2.filter((s) => s.currentTemperature > 60).length;
    return { normal, warning, critical };
  }
  async getTemperatureTrends(hours) {
    const now = /* @__PURE__ */ new Date();
    const switches2 = Array.from(this.switches.values()).slice(0, 5);
    const dataPoints = [];
    for (let i = hours; i >= 0; i--) {
      const timestamp2 = new Date(now.getTime() - i * 60 * 60 * 1e3);
      const dataPoint = {
        timestamp: timestamp2.toISOString()
      };
      switches2.forEach((switchItem) => {
        const readings = Array.from(this.temperatureReadings.values()).filter((r) => r.switchId === switchItem.id).filter((r) => Math.abs((r.timestamp?.getTime() || 0) - timestamp2.getTime()) < 30 * 60 * 1e3).sort((a, b) => Math.abs((a.timestamp?.getTime() || 0) - timestamp2.getTime()) - Math.abs((b.timestamp?.getTime() || 0) - timestamp2.getTime()));
        if (readings.length > 0) {
          dataPoint[switchItem.name] = Math.round(readings[0].temperature * 10) / 10;
        }
      });
      dataPoints.push(dataPoint);
    }
    return dataPoints;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var switches = pgTable("switches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  model: text("model").notNull(),
  location: text("location").notNull(),
  rack: text("rack"),
  site: text("site").notNull(),
  switchType: text("switch_type").notNull(),
  // access, distribution, core
  currentTemperature: real("current_temperature").notNull(),
  isOnline: boolean("is_online").default(true),
  lastUpdate: timestamp("last_update").defaultNow()
});
var temperatureReadings = pgTable("temperature_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  switchId: varchar("switch_id").references(() => switches.id).notNull(),
  temperature: real("temperature").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertSwitchSchema = createInsertSchema(switches).omit({
  id: true,
  lastUpdate: true
});
var insertTemperatureReadingSchema = createInsertSchema(temperatureReadings).omit({
  id: true,
  timestamp: true
});

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/switches", async (req, res) => {
    try {
      const switches2 = await storage.getSwitches();
      for (const switchData of switches2) {
        await storage.updateSwitchTemperature(switchData.id, switchData.currentTemperature);
      }
      res.json(switches2);
    } catch (error) {
      console.error("Error fetching switches:", error);
      res.status(500).json({ message: "Failed to fetch switches" });
    }
  });
  app2.get("/api/switches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const switchData = await storage.getSwitch(id);
      if (!switchData) {
        return res.status(404).json({ message: "Switch not found" });
      }
      res.json(switchData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch switch" });
    }
  });
  app2.post("/api/switches", async (req, res) => {
    try {
      const validatedData = insertSwitchSchema.parse(req.body);
      const newSwitch = await storage.createSwitch(validatedData);
      res.status(201).json(newSwitch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid switch data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create switch" });
    }
  });
  app2.patch("/api/switches/:id/temperature", async (req, res) => {
    try {
      const { id } = req.params;
      const { temperature } = req.body;
      if (typeof temperature !== "number") {
        return res.status(400).json({ message: "Temperature must be a number" });
      }
      const updatedSwitch = await storage.updateSwitchTemperature(id, temperature);
      if (!updatedSwitch) {
        return res.status(404).json({ message: "Switch not found" });
      }
      res.json(updatedSwitch);
    } catch (error) {
      res.status(500).json({ message: "Failed to update switch temperature" });
    }
  });
  app2.get("/api/temperature-readings", async (req, res) => {
    try {
      const { switchId, limit } = req.query;
      const readings = await storage.getTemperatureReadings(
        switchId,
        limit ? parseInt(limit) : void 0
      );
      res.json(readings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch temperature readings" });
    }
  });
  app2.post("/api/temperature-readings", async (req, res) => {
    try {
      const validatedData = insertTemperatureReadingSchema.parse(req.body);
      const newReading = await storage.createTemperatureReading(validatedData);
      res.status(201).json(newReading);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid temperature reading data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create temperature reading" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/dashboard/temperature-distribution", async (req, res) => {
    try {
      const distribution = await storage.getTemperatureDistribution();
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch temperature distribution" });
    }
  });
  app2.get("/api/dashboard/temperature-trends", async (req, res) => {
    try {
      const { hours = 24 } = req.query;
      const trends = await storage.getTemperatureTrends(parseInt(hours));
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch temperature trends" });
    }
  });
  app2.post("/api/dashboard/refresh", async (req, res) => {
    try {
      const refreshResult = await catalystCenterAPI.refreshDeviceData();
      if (refreshResult.success) {
        const stats = await storage.getDashboardStats();
        res.json({
          message: refreshResult.message,
          stats,
          source: "catalyst-center"
        });
      } else {
        const switches2 = await storage.getSwitches();
        for (const switchData of switches2) {
          const variation = (Math.random() - 0.5) * 4;
          const newTemp = Math.max(20, Math.min(80, switchData.currentTemperature + variation));
          await storage.updateSwitchTemperature(switchData.id, newTemp);
        }
        const stats = await storage.getDashboardStats();
        res.json({
          message: "Data refreshed using mock data (Catalyst Center unavailable)",
          stats,
          source: "mock-data",
          catalystCenterError: refreshResult.message
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to refresh data" });
    }
  });
  app2.get("/api/catalyst-center/status", async (req, res) => {
    try {
      const result = await catalystCenterAPI.refreshDeviceData();
      res.json({
        connected: result.success,
        message: result.message,
        switchCount: result.switchCount,
        dataSource: result.success ? "catalyst-center" : "mock-data"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.json({
        connected: false,
        message: `Connection failed: ${errorMessage}`,
        switchCount: 0,
        dataSource: "mock-data"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";

// node_modules/@replit/vite-plugin-runtime-error-modal/dist/index.mjs
import { readFileSync } from "node:fs";

// node_modules/@jridgewell/trace-mapping/dist/trace-mapping.mjs
init_sourcemap_codec();

// node_modules/@jridgewell/resolve-uri/dist/resolve-uri.mjs
var schemeRegex = /^[\w+.-]+:\/\//;
var urlRegex = /^([\w+.-]+:)\/\/([^@/#?]*@)?([^:/#?]*)(:\d+)?(\/[^#?]*)?(\?[^#]*)?(#.*)?/;
var fileRegex = /^file:(?:\/\/((?![a-z]:)[^/#?]*)?)?(\/?[^#?]*)(\?[^#]*)?(#.*)?/i;
function isAbsoluteUrl(input) {
  return schemeRegex.test(input);
}
function isSchemeRelativeUrl(input) {
  return input.startsWith("//");
}
function isAbsolutePath(input) {
  return input.startsWith("/");
}
function isFileUrl(input) {
  return input.startsWith("file:");
}
function isRelative(input) {
  return /^[.?#]/.test(input);
}
function parseAbsoluteUrl(input) {
  const match = urlRegex.exec(input);
  return makeUrl(match[1], match[2] || "", match[3], match[4] || "", match[5] || "/", match[6] || "", match[7] || "");
}
function parseFileUrl(input) {
  const match = fileRegex.exec(input);
  const path4 = match[2];
  return makeUrl("file:", "", match[1] || "", "", isAbsolutePath(path4) ? path4 : "/" + path4, match[3] || "", match[4] || "");
}
function makeUrl(scheme, user, host, port, path4, query, hash) {
  return {
    scheme,
    user,
    host,
    port,
    path: path4,
    query,
    hash,
    type: 7
  };
}
function parseUrl(input) {
  if (isSchemeRelativeUrl(input)) {
    const url2 = parseAbsoluteUrl("http:" + input);
    url2.scheme = "";
    url2.type = 6;
    return url2;
  }
  if (isAbsolutePath(input)) {
    const url2 = parseAbsoluteUrl("http://foo.com" + input);
    url2.scheme = "";
    url2.host = "";
    url2.type = 5;
    return url2;
  }
  if (isFileUrl(input))
    return parseFileUrl(input);
  if (isAbsoluteUrl(input))
    return parseAbsoluteUrl(input);
  const url = parseAbsoluteUrl("http://foo.com/" + input);
  url.scheme = "";
  url.host = "";
  url.type = input ? input.startsWith("?") ? 3 : input.startsWith("#") ? 2 : 4 : 1;
  return url;
}
function stripPathFilename(path4) {
  if (path4.endsWith("/.."))
    return path4;
  const index = path4.lastIndexOf("/");
  return path4.slice(0, index + 1);
}
function mergePaths(url, base) {
  normalizePath(base, base.type);
  if (url.path === "/") {
    url.path = base.path;
  } else {
    url.path = stripPathFilename(base.path) + url.path;
  }
}
function normalizePath(url, type) {
  const rel = type <= 4;
  const pieces = url.path.split("/");
  let pointer = 1;
  let positive = 0;
  let addTrailingSlash = false;
  for (let i = 1; i < pieces.length; i++) {
    const piece = pieces[i];
    if (!piece) {
      addTrailingSlash = true;
      continue;
    }
    addTrailingSlash = false;
    if (piece === ".")
      continue;
    if (piece === "..") {
      if (positive) {
        addTrailingSlash = true;
        positive--;
        pointer--;
      } else if (rel) {
        pieces[pointer++] = piece;
      }
      continue;
    }
    pieces[pointer++] = piece;
    positive++;
  }
  let path4 = "";
  for (let i = 1; i < pointer; i++) {
    path4 += "/" + pieces[i];
  }
  if (!path4 || addTrailingSlash && !path4.endsWith("/..")) {
    path4 += "/";
  }
  url.path = path4;
}
function resolve(input, base) {
  if (!input && !base)
    return "";
  const url = parseUrl(input);
  let inputType = url.type;
  if (base && inputType !== 7) {
    const baseUrl = parseUrl(base);
    const baseType = baseUrl.type;
    switch (inputType) {
      case 1:
        url.hash = baseUrl.hash;
      // fall through
      case 2:
        url.query = baseUrl.query;
      // fall through
      case 3:
      case 4:
        mergePaths(url, baseUrl);
      // fall through
      case 5:
        url.user = baseUrl.user;
        url.host = baseUrl.host;
        url.port = baseUrl.port;
      // fall through
      case 6:
        url.scheme = baseUrl.scheme;
    }
    if (baseType > inputType)
      inputType = baseType;
  }
  normalizePath(url, inputType);
  const queryHash = url.query + url.hash;
  switch (inputType) {
    // This is impossible, because of the empty checks at the start of the function.
    // case UrlType.Empty:
    case 2:
    case 3:
      return queryHash;
    case 4: {
      const path4 = url.path.slice(1);
      if (!path4)
        return queryHash || ".";
      if (isRelative(base || input) && !isRelative(path4)) {
        return "./" + path4 + queryHash;
      }
      return path4 + queryHash;
    }
    case 5:
      return url.path + queryHash;
    default:
      return url.scheme + "//" + url.user + url.host + url.port + url.path + queryHash;
  }
}

// node_modules/@jridgewell/trace-mapping/dist/trace-mapping.mjs
function resolve2(input, base) {
  if (base && !base.endsWith("/"))
    base += "/";
  return resolve(input, base);
}
function stripFilename(path4) {
  if (!path4)
    return "";
  const index = path4.lastIndexOf("/");
  return path4.slice(0, index + 1);
}
var COLUMN = 0;
var SOURCES_INDEX = 1;
var SOURCE_LINE = 2;
var SOURCE_COLUMN = 3;
var NAMES_INDEX = 4;
function maybeSort(mappings, owned) {
  const unsortedIndex = nextUnsortedSegmentLine(mappings, 0);
  if (unsortedIndex === mappings.length)
    return mappings;
  if (!owned)
    mappings = mappings.slice();
  for (let i = unsortedIndex; i < mappings.length; i = nextUnsortedSegmentLine(mappings, i + 1)) {
    mappings[i] = sortSegments(mappings[i], owned);
  }
  return mappings;
}
function nextUnsortedSegmentLine(mappings, start) {
  for (let i = start; i < mappings.length; i++) {
    if (!isSorted(mappings[i]))
      return i;
  }
  return mappings.length;
}
function isSorted(line) {
  for (let j = 1; j < line.length; j++) {
    if (line[j][COLUMN] < line[j - 1][COLUMN]) {
      return false;
    }
  }
  return true;
}
function sortSegments(line, owned) {
  if (!owned)
    line = line.slice();
  return line.sort(sortComparator2);
}
function sortComparator2(a, b) {
  return a[COLUMN] - b[COLUMN];
}
var found = false;
function binarySearch(haystack, needle, low, high) {
  while (low <= high) {
    const mid = low + (high - low >> 1);
    const cmp = haystack[mid][COLUMN] - needle;
    if (cmp === 0) {
      found = true;
      return mid;
    }
    if (cmp < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  found = false;
  return low - 1;
}
function upperBound(haystack, needle, index) {
  for (let i = index + 1; i < haystack.length; index = i++) {
    if (haystack[i][COLUMN] !== needle)
      break;
  }
  return index;
}
function lowerBound(haystack, needle, index) {
  for (let i = index - 1; i >= 0; index = i--) {
    if (haystack[i][COLUMN] !== needle)
      break;
  }
  return index;
}
function memoizedState() {
  return {
    lastKey: -1,
    lastNeedle: -1,
    lastIndex: -1
  };
}
function memoizedBinarySearch(haystack, needle, state, key) {
  const { lastKey, lastNeedle, lastIndex } = state;
  let low = 0;
  let high = haystack.length - 1;
  if (key === lastKey) {
    if (needle === lastNeedle) {
      found = lastIndex !== -1 && haystack[lastIndex][COLUMN] === needle;
      return lastIndex;
    }
    if (needle >= lastNeedle) {
      low = lastIndex === -1 ? 0 : lastIndex;
    } else {
      high = lastIndex;
    }
  }
  state.lastKey = key;
  state.lastNeedle = needle;
  return state.lastIndex = binarySearch(haystack, needle, low, high);
}
var LINE_GTR_ZERO = "`line` must be greater than 0 (lines start at line 1)";
var COL_GTR_EQ_ZERO = "`column` must be greater than or equal to 0 (columns start at column 0)";
var LEAST_UPPER_BOUND = -1;
var GREATEST_LOWER_BOUND = 1;
var TraceMap = class {
  constructor(map, mapUrl) {
    const isString = typeof map === "string";
    if (!isString && map._decodedMemo)
      return map;
    const parsed = isString ? JSON.parse(map) : map;
    const { version: version2, file, names, sourceRoot, sources, sourcesContent } = parsed;
    this.version = version2;
    this.file = file;
    this.names = names || [];
    this.sourceRoot = sourceRoot;
    this.sources = sources;
    this.sourcesContent = sourcesContent;
    this.ignoreList = parsed.ignoreList || parsed.x_google_ignoreList || void 0;
    const from = resolve2(sourceRoot || "", stripFilename(mapUrl));
    this.resolvedSources = sources.map((s) => resolve2(s || "", from));
    const { mappings } = parsed;
    if (typeof mappings === "string") {
      this._encoded = mappings;
      this._decoded = void 0;
    } else {
      this._encoded = void 0;
      this._decoded = maybeSort(mappings, isString);
    }
    this._decodedMemo = memoizedState();
    this._bySources = void 0;
    this._bySourceMemos = void 0;
  }
};
function cast(map) {
  return map;
}
function decodedMappings(map) {
  var _a;
  return (_a = cast(map))._decoded || (_a._decoded = decode(cast(map)._encoded));
}
function originalPositionFor(map, needle) {
  let { line, column, bias } = needle;
  line--;
  if (line < 0)
    throw new Error(LINE_GTR_ZERO);
  if (column < 0)
    throw new Error(COL_GTR_EQ_ZERO);
  const decoded = decodedMappings(map);
  if (line >= decoded.length)
    return OMapping(null, null, null, null);
  const segments = decoded[line];
  const index = traceSegmentInternal(segments, cast(map)._decodedMemo, line, column, bias || GREATEST_LOWER_BOUND);
  if (index === -1)
    return OMapping(null, null, null, null);
  const segment = segments[index];
  if (segment.length === 1)
    return OMapping(null, null, null, null);
  const { names, resolvedSources } = map;
  return OMapping(resolvedSources[segment[SOURCES_INDEX]], segment[SOURCE_LINE] + 1, segment[SOURCE_COLUMN], segment.length === 5 ? names[segment[NAMES_INDEX]] : null);
}
function OMapping(source, line, column, name) {
  return { source, line, column, name };
}
function traceSegmentInternal(segments, memo, line, column, bias) {
  let index = memoizedBinarySearch(segments, column, memo, line);
  if (found) {
    index = (bias === LEAST_UPPER_BOUND ? upperBound : lowerBound)(segments, column, index);
  } else if (bias === LEAST_UPPER_BOUND)
    index++;
  if (index === -1 || index === segments.length)
    return -1;
  return index;
}

// node_modules/@replit/vite-plugin-runtime-error-modal/dist/index.mjs
var packageName = "runtime-error-plugin";
function viteRuntimeErrorOverlayPlugin(options) {
  return {
    name: packageName,
    apply(config, env) {
      return env.command === "serve" && !config.ssr;
    },
    transformIndexHtml() {
      return [
        {
          tag: "script",
          attrs: { type: "module" },
          children: CLIENT_SCRIPT
        }
      ];
    },
    configureServer(server) {
      server.ws.on(MESSAGE_TYPE, (data, client) => {
        const error = Object.assign(new Error(), data);
        if (!error.stack) {
          return;
        }
        if (options?.filter && !options.filter(error)) {
          return;
        }
        const { stack, loc } = rewriteStacktrace(
          error.stack,
          server.moduleGraph
        );
        const err = {
          name: error.name,
          message: error.message,
          stack,
          loc,
          plugin: packageName
        };
        if (loc?.file) {
          err.id = loc?.file;
          const source = readFileSync(loc.file, "utf-8");
          err.frame = generateCodeFrame(source, {
            line: loc.line,
            column: loc.column - 1
          });
        }
        client.send({
          type: "error",
          err
        });
      });
    }
  };
}
var MESSAGE_TYPE = `${packageName}:error`;
var CLIENT_SCRIPT = `
import { createHotContext } from "/@vite/client";
const hot = createHotContext("/__dummy__${packageName}");

function sendError(error) {
  if (!(error instanceof Error)) {
    error = new Error("(unknown runtime error)");
  }
  const serialized = {
    message: error.message,
    stack: error.stack,
  };
  hot.send("${MESSAGE_TYPE}", serialized);
}

window.addEventListener("error", (evt) => {
  sendError(evt.error);
});

window.addEventListener("unhandledrejection", (evt) => {
  sendError(evt.reason);
});
`;
function cleanStack(stack) {
  return stack.split(/\n/g).filter((l) => /^\s*at/.test(l)).join("\n");
}
function rewriteStacktrace(stack, moduleGraph) {
  let loc = void 0;
  const rewrittenStack = cleanStack(stack).split("\n").map((line) => {
    return line.replace(
      /^ {4}at (?:(\S+?) )?\(?(?:https|http):\/\/[^\/]+(\/[^\s?]+).*:(\d+):(\d+)\)?$/,
      (input, varName, url, line2, column) => {
        if (!url) {
          return input;
        }
        const module = moduleGraph.urlToModuleMap.get(url);
        if (!module) {
          return "";
        }
        const rawSourceMap = module?.transformResult?.map;
        if (rawSourceMap) {
          const traced = new TraceMap(rawSourceMap);
          const pos = originalPositionFor(traced, {
            line: Number(line2),
            // stacktrace's column is 1-indexed, but sourcemap's one is 0-indexed
            column: Number(column) - 1
          });
          if (pos.source && pos.line >= 0 && pos.column >= 0) {
            line2 = pos.line;
            column = pos.column + 1;
          }
        }
        const trimmedVarName = varName?.trim();
        const sourceFile = module.file;
        const source = `${module.file}:${line2}:${column}`;
        if (sourceFile) {
          loc ??= {
            line: Number(line2),
            column: Number(column),
            file: sourceFile
          };
        }
        if (!trimmedVarName || trimmedVarName === "eval") {
          return `    at ${source}`;
        } else {
          return `    at ${trimmedVarName} ${source}`;
        }
      }
    );
  }).join("\n");
  return {
    stack: rewrittenStack,
    loc
  };
}
var splitRE = /\r?\n/g;
var range = 2;
function posToNumber(source, pos) {
  if (typeof pos === "number") {
    return pos;
  }
  const lines = source.split(splitRE);
  const { line, column } = pos;
  let start = 0;
  for (let i = 0; i < line - 1 && i < lines.length; i++) {
    start += lines[i].length + 1;
  }
  return start + column;
}
function generateCodeFrame(source, start = 0, end) {
  start = Math.max(posToNumber(source, start), 0);
  end = Math.min(
    end !== void 0 ? posToNumber(source, end) : start,
    source.length
  );
  const lines = source.split(splitRE);
  let count = 0;
  const res = [];
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length;
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length) {
          continue;
        }
        const line = j + 1;
        res.push(
          `${line}${" ".repeat(Math.max(3 - String(line).length, 0))}|  ${lines[j]}`
        );
        const lineLength = lines[j].length;
        if (j === i) {
          const pad = Math.max(start - (count - lineLength), 0);
          const length = Math.max(
            1,
            end > count ? lineLength - pad : end - start
          );
          res.push(`   |  ` + " ".repeat(pad) + "^".repeat(length));
        } else if (j > i) {
          if (end > count) {
            const length = Math.max(Math.min(end - count, lineLength), 1);
            res.push(`   |  ` + "^".repeat(length));
          }
          count += lineLength + 1;
        }
      }
      break;
    }
    count++;
  }
  return res.join("\n");
}

// vite.config.ts
var vite_config_default = defineConfig({
  plugins: [
    react(),
    viteRuntimeErrorOverlayPlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await Promise.resolve().then(() => (init_dist(), dist_exports)).then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import dotenv from "dotenv";
dotenv.config();
console.log("Catalyst Center Configuration:", {
  baseUrl: process.env.CATALYST_CENTER_BASE_URL ? "SET" : "NOT SET",
  username: process.env.CATALYST_CENTER_USERNAME ? "SET" : "NOT SET",
  password: process.env.CATALYST_CENTER_PASSWORD ? "SET" : "NOT SET"
});
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.platform === "darwin" ? "localhost" : "0.0.0.0";
  server.listen({
    port,
    host,
    reusePort: true
  }, () => {
    log(`serving on ${host}:${port}`);
  });
})();
