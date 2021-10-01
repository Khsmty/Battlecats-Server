module.exports = function (topic) {
  const spl1 = topic.split('<@')[1]
  const spl2 = spl1.split('>')[0]

  return spl2
}
