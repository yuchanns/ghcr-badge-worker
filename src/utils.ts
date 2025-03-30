export const makeAuthToken = (owner: string, repo: string) => btoa(`v1:${owner}/${repo}:0`)

export const makeHeaders = (config: GHCRConfig) => {
  const headers = new Headers()
  headers.set("Authorization", `Bearer ${makeAuthToken(config.owner, config.repo)}`)
  headers.set("User-Agent", config.userAgent || "Docker-Client/20.10.2 (linux)")
  return headers
}

export const getBadge = (label: string, value: string, default_color = "#44cc11") => {
  const calculateTextWidth = (text: string): number => {
    const charWidths: Record<string, number> = {
      "i": 0.5, "l": 0.5, "j": 0.5, "I": 0.5, "f": 0.6, "r": 0.6, "t": 0.6,
      "m": 1.6, "w": 1.6, "M": 1.6, "W": 1.6, "G": 1.3, "O": 1.3, "Q": 1.3,
      ".": 0.5, "|": 0.5, "=": 1.0, "-": 0.6, "_": 1.0,
    }

    const width = text.split("").reduce((total, char) => {
      return total + (charWidths[char] || 1.0)
    }, 0)

    return width * 6.5
  }

  const labelTextWidth = calculateTextWidth(label)
  const valueTextWidth = calculateTextWidth(value ?? "")

  const labelWidth = Math.round(labelTextWidth + 20)
  const messageWidth = Math.round(valueTextWidth + 20)
  const totalWidth = labelWidth + messageWidth

  const colorMap: Record<string, string> = {
    "green": "#4c1",
    "red": "#e05d44",
    "blue": "#007ec6",
    "yellow": "#dfb317",
    "orange": "#fe7d37",
    "purple": "#9370db",
    "lightgrey": "#9f9f9f",
  }

  const bgColor = colorMap[default_color.toLowerCase()] || default_color

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
    <linearGradient id="b" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>

    <mask id="a">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </mask>
    <g mask="url(#a)">
      <path fill="#555" d="M0 0h${labelWidth}v20H0z"/>
      <path fill="${bgColor}" d="M${labelWidth} 0h${messageWidth}v20H${labelWidth}z"/>
      <path fill="url(#b)" d="M0 0h${totalWidth}v20H0z"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
      <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
      <text x="${labelWidth / 2}" y="14">${label}</text>
      <text x="${labelWidth + messageWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
      <text x="${labelWidth + messageWidth / 2}" y="14">${value}</text>
    </g>
  </svg>`
}

const globToRegex = (pattern: string) => {
  const escapeRegex = (s: string) => s.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&")

  let regexStr = ""
  for (const char of pattern) {
    if (char === "*") {
      regexStr += ".*"
    } else if (char === "?") {
      regexStr += "."
    } else {
      regexStr += escapeRegex(char)
    }
  }
  return new RegExp("^" + regexStr + "$")
}

export const fnmatch = (name: string, pattern: string) => {
  const regex = globToRegex(pattern)
  return regex.test(name)
}
