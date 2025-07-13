
function title(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function capitalize(str: string) {
  return str.split(" ").map(title).join(" ")
}


export { title, capitalize }
