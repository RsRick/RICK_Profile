// Advanced custom syntax highlighter
// Uses a tokenization approach to prevent regex collisions and broken HTML

const COMMON_PATTERNS = {
  string: { pattern: /(["'`])(?:(?=(\\?))\2.)*?\1/g, alias: 'string' },
  comment: { pattern: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, alias: 'comment' },
  number: { pattern: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/gi, alias: 'number' },
  boolean: { pattern: /\b(true|false|null|undefined|NaN|Infinity)\b/g, alias: 'boolean' },
  operator: { pattern: /[+\-*/%=<>!&|^~?:]/g, alias: 'operator' },
  punctuation: { pattern: /[{}[\];(),.:]/g, alias: 'punctuation' },
};

const KEYWORDS = {
  javascript: /\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/g,
  typescript: /\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield|type|namespace|module|declare|abstract|readonly)\b/g,
  python: /\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/g,
  java: /\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)\b/g,
  csharp: /\b(abstract|as|async|await|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while)\b/g,
  php: /\b(abstract|and|array|as|break|callable|case|catch|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|eval|exit|extends|final|finally|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|namespace|new|or|print|private|protected|public|require|require_once|return|static|switch|throw|trait|try|unset|use|var|while|xor|yield)\b/g,
  bash: /\b(if|then|else|elif|fi|for|while|in|do|done|case|esac|function|return|exit|export|local|declare|readonly|alias|unalias|source|echo|printf|read|cd|pwd|ls|mkdir|rm|cp|mv|touch|cat|grep|sed|awk|find|chmod|chown|sudo|su|ssh|scp|git|npm|node|yarn)\b/g,
  sql: /\b(ADD|ALL|ALTER|AND|ANY|AS|ASC|AUTHORIZATION|BACKUP|BEGIN|BETWEEN|BREAK|BROWSE|BULK|BY|CASCADE|CASE|CHECK|CHECKPOINT|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMN|COMMIT|COMPUTE|CONSTRAINT|CONTAINS|CONTAINSTABLE|CONTINUE|CONVERT|CREATE|CROSS|CURRENT|CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP|CURRENT_USER|CURSOR|DATABASE|DBCC|DEALLOCATE|DECLARE|DEFAULT|DELETE|DENY|DESC|DISK|DISTINCT|DISTRIBUTED|DOUBLE|DROP|DUMP|ELSE|END|ERRLVL|ESCAPE|EXCEPT|EXEC|EXECUTE|EXISTS|EXIT|EXTERNAL|FETCH|FILE|FILLFACTOR|FOR|FOREIGN|FREETEXT|FREETEXTTABLE|FROM|FULL|FUNCTION|GOTO|GRANT|GROUP|HAVING|HOLDLOCK|IDENTITY|IDENTITY_INSERT|IDENTITYCOL|IF|IN|INDEX|INNER|INSERT|INTERSECT|INTO|IS|JOIN|KEY|KILL|LEFT|LIKE|LINENO|LOAD|MERGE|NATIONAL|NOCHECK|NONCLUSTERED|NOT|NULL|NULLIF|OF|OFF|OFFSETS|ON|OPEN|OPENDATASOURCE|OPENQUERY|OPENROWSET|OPENXML|OPTION|OR|ORDER|OUTER|OVER|PERCENT|PIVOT|PLAN|PRECISION|PRIMARY|PRINT|PROC|PROCEDURE|PUBLIC|RAISERROR|READ|READTEXT|RECONFIGURE|REFERENCES|REPLICATION|RESTORE|RESTRICT|RETURN|REVERT|REVOKE|RIGHT|ROLLBACK|ROWCOUNT|ROWGUIDCOL|RULE|SAVE|SCHEMA|SECURITYAUDIT|SELECT|SEMANTICKEYPHRASETABLE|SEMANTICSIMILARITYDETAILSTABLE|SEMANTICSIMILARITYTABLE|SESSION_USER|SET|SETUSER|SHUTDOWN|SOME|STATISTICS|SYSTEM_USER|TABLE|TABLESAMPLE|TEXTSIZE|THEN|TO|TOP|TRAN|TRANSACTION|TRIGGER|TRUNCATE|TRY_CONVERT|TSEQUAL|UNION|UNIQUE|UNPIVOT|UPDATE|UPDATETEXT|USE|USER|VALUES|VARYING|VIEW|WAITFOR|WHEN|WHERE|WHILE|WITH|WITHIN GROUP|WRITETEXT)\b/gi,
};

const SYNTAX_CONFIG = {
  javascript: [
    COMMON_PATTERNS.comment,
    COMMON_PATTERNS.string,
    { pattern: KEYWORDS.javascript, alias: 'keyword' },
    { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g, alias: 'function' },
    { pattern: /\b([A-Z][a-zA-Z0-9_$]*)\b/g, alias: 'class-name' },
    { pattern: /\b(console|window|document|localStorage|sessionStorage|JSON|Math|Date|Array|Object|String|Number|Boolean|Promise|Map|Set)\b/g, alias: 'builtin' },
    COMMON_PATTERNS.boolean,
    COMMON_PATTERNS.number,
    COMMON_PATTERNS.operator,
    COMMON_PATTERNS.punctuation,
  ],
  typescript: [
    COMMON_PATTERNS.comment,
    COMMON_PATTERNS.string,
    { pattern: KEYWORDS.typescript, alias: 'keyword' },
    { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g, alias: 'function' },
    { pattern: /\b([A-Z][a-zA-Z0-9_$]*)\b/g, alias: 'class-name' },
    { pattern: /\b(console|window|document|localStorage|sessionStorage|JSON|Math|Date|Array|Object|String|Number|Boolean|Promise|Map|Set|any|string|number|boolean|void|never|unknown)\b/g, alias: 'builtin' },
    COMMON_PATTERNS.boolean,
    COMMON_PATTERNS.number,
    COMMON_PATTERNS.operator,
    COMMON_PATTERNS.punctuation,
  ],
  python: [
    { pattern: /(["'])(?:(?=(\\?))\2.)*?\1|("""|''')[\s\S]*?\3/g, alias: 'string' },
    COMMON_PATTERNS.comment,
    { pattern: KEYWORDS.python, alias: 'keyword' },
    { pattern: /\bdef\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, alias: 'function' },
    { pattern: /\bclass\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, alias: 'class-name' },
    { pattern: /\b(abs|all|any|bin|bool|bytearray|bytes|callable|chr|classmethod|compile|complex|delattr|dict|dir|divmod|enumerate|eval|exec|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|isinstance|issubclass|iter|len|list|locals|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|vars|zip)\b/g, alias: 'builtin' },
    COMMON_PATTERNS.boolean,
    COMMON_PATTERNS.number,
    COMMON_PATTERNS.operator,
    COMMON_PATTERNS.punctuation,
  ],
  html: [
    { pattern: /<!--[\s\S]*?-->/g, alias: 'comment' },
    { pattern: /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, alias: 'tag' },
    { pattern: /\b([a-z][a-z0-9-]*)(?=\s*=)/gi, alias: 'attr-name' },
    { pattern: /=(["'])(?:(?=(\\?))\2.)*?\1/g, alias: 'attr-value' },
    { pattern: /("|')[\s\S]*?\1/g, alias: 'string' },
  ],
  css: [
    { pattern: /\/\*[\s\S]*?\*\//g, alias: 'comment' },
    { pattern: /([^{}]+)(?=\{)/g, alias: 'selector' },
    { pattern: /([a-zA-Z-]+)(?=:)/g, alias: 'property' },
    { pattern: /:([^;]+)/g, alias: 'value' },
    { pattern: /!important/g, alias: 'important' },
    COMMON_PATTERNS.string,
  ],
  // Fallbacks for others
  java: [COMMON_PATTERNS.comment, COMMON_PATTERNS.string, { pattern: KEYWORDS.java, alias: 'keyword' }, COMMON_PATTERNS.number, COMMON_PATTERNS.operator, COMMON_PATTERNS.punctuation],
  csharp: [COMMON_PATTERNS.comment, COMMON_PATTERNS.string, { pattern: KEYWORDS.csharp, alias: 'keyword' }, COMMON_PATTERNS.number, COMMON_PATTERNS.operator, COMMON_PATTERNS.punctuation],
  php: [COMMON_PATTERNS.comment, COMMON_PATTERNS.string, { pattern: KEYWORDS.php, alias: 'keyword' }, { pattern: /\$+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/g, alias: 'variable' }, COMMON_PATTERNS.number, COMMON_PATTERNS.operator, COMMON_PATTERNS.punctuation],
  sql: [COMMON_PATTERNS.comment, COMMON_PATTERNS.string, { pattern: KEYWORDS.sql, alias: 'keyword' }, COMMON_PATTERNS.number, COMMON_PATTERNS.operator, COMMON_PATTERNS.punctuation],
  bash: [COMMON_PATTERNS.comment, COMMON_PATTERNS.string, { pattern: KEYWORDS.bash, alias: 'keyword' }, { pattern: /\$+[a-zA-Z_][a-zA-Z0-9_]*/g, alias: 'variable' }, COMMON_PATTERNS.operator],
};

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function highlightCode(code, language = 'javascript') {
  if (!code) return '';
  
  const lang = language.toLowerCase();
  
  // Handle "no-color" language - return plain escaped text
  if (lang === 'no-color') {
    return escapeHtml(code);
  }
  
  const rules = SYNTAX_CONFIG[lang] || SYNTAX_CONFIG.javascript;
  
  // Tokenize
  // We'll use a simple approach: find the earliest match among all rules, consume it, repeat.
  // This is O(N*M) where N is code length and M is number of rules.
  
  let tokens = [];
  let remaining = code;
  
  while (remaining.length > 0) {
    let bestMatch = null;
    let bestRule = null;
    let minIndex = remaining.length;
    
    // Find the earliest match
    for (const rule of rules) {
      // Reset regex lastIndex
      rule.pattern.lastIndex = 0;
      const match = rule.pattern.exec(remaining);
      
      if (match) {
        if (match.index < minIndex) {
          minIndex = match.index;
          bestMatch = match;
          bestRule = rule;
        }
      }
    }
    
    if (bestMatch && minIndex === 0) {
      // Match at start
      tokens.push({ type: bestRule.alias, content: bestMatch[0] });
      remaining = remaining.slice(bestMatch[0].length);
    } else if (bestMatch) {
      // Match later, consume text before it
      tokens.push({ type: 'text', content: remaining.slice(0, minIndex) });
      tokens.push({ type: bestRule.alias, content: bestMatch[0] });
      remaining = remaining.slice(minIndex + bestMatch[0].length);
    } else {
      // No match found in remaining text
      tokens.push({ type: 'text', content: remaining });
      remaining = '';
    }
  }
  
  // Convert tokens to HTML
  return tokens.map(token => {
    if (token.type === 'text') {
      return escapeHtml(token.content);
    }
    return `<span class="token ${token.type}">${escapeHtml(token.content)}</span>`;
  }).join('');
}
