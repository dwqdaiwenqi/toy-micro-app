let templateStyle

export default function scopedCSS (styleElement, appName) {
  const prefix = `toy-micro-app[name=${appName}]`

  if (!templateStyle) {
    templateStyle = document.createElement('style')
    document.body.appendChild(templateStyle)
    templateStyle.sheet.disabled = true
  }

  if (styleElement.textContent) {
    templateStyle.textContent = styleElement.textContent

    styleElement.textContent = scopedRule(Array.from(templateStyle.sheet?.cssRules ?? []), prefix)

    templateStyle.textContent = ''
  } else {
    const observer = new MutationObserver(function () {
      observer.disconnect()
      styleElement.textContent = scopedRule(Array.from(styleElement.sheet?.cssRules ?? []), prefix)
    })

    observer.observe(styleElement, { childList: true })
  }
}


 function scopedRule (rules, prefix) {
  let result = ''

  for (const rule of rules) {
    switch (rule.type) {
      case 1: // STYLE_RULE
        result += scopedStyleRule(rule, prefix)
        break
      case 4: // MEDIA_RULE
        result += scopedPackRule(rule, prefix, 'media')
        break
      case 12: // SUPPORTS_RULE
        result += scopedPackRule(rule, prefix, 'supports')
        break
      default:
        result += rule.cssText
        break
    }
  }

  return result
}
function scopedPackRule (rule, prefix, packName) {
  const result = scopedRule(Array.from(rule.cssRules), prefix)
  return `@${packName} ${rule.conditionText} {${result}}`
}

function scopedStyleRule (rule, prefix) {
  const { selectorText, cssText } = rule

  if (/^((html[\s>~,]+body)|(html|body|:root))$/.test(selectorText)) {
    return cssText.replace(/^((html[\s>~,]+body)|(html|body|:root))/, prefix)
  } else if (selectorText === '*') {
    return cssText.replace('*', `${prefix} *`)
  }

  const builtInRootSelectorRE = /(^|\s+)((html[\s>~]+body)|(html|body|:root))(?=[\s>~]+|$)/

  return cssText.replace(/^[\s\S]+{/, (selectors) => {
    return selectors.replace(/(^|,)([^,]+)/g, (all, $1, $2) => {
      if (builtInRootSelectorRE.test($2)) {
        return all.replace(builtInRootSelectorRE, prefix)
      }
      return `${$1} ${prefix} ${$2.replace(/^\s*/, '')}`
    })
  })
}
