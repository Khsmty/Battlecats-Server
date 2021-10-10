module.exports = function (topic: String) {
  let spl
  if (topic.includes('!')) {
    spl = topic.split('<@!')[1]
  } else {
    spl = topic.split('<@')[1]
  }

  return spl.split('>')[0]
}
