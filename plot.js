let rawDataURL = 'https://raw.githubusercontent.com/chinatimeline/data/master/ideology/CCP_Ideology_Events.csv'
let termURL = 'https://raw.githubusercontent.com/chinatimeline/data/master/ideology/CCP_Presidential_term.csv'

let weekDays = [
  '周日 Sun',
  '周一 Mon',
  '周二 Tue',
  '周三 Wed',
  '周四 Thu',
  '周五 Fri',
  '周六 Sat',
]

let shapeColors = [
  '#A6CEE3',
  '#1F78B4',
  '#B2DF8A',
  '#33A02C',
  '#FB9A99'
]

function loadCSV(url) {
  return new Promise((resolve, reject) => {
    Plotly.d3.csv(url, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

Promise.all([loadCSV(rawDataURL), loadCSV(termURL)]).then(([events, terms]) => {
  let eventData = prepEventData(events)
  let termData = prepTermData(terms)
  let termShapes = prepTermShapes(terms)

  let layout = {
    title: '<b>中共意识形态保卫战时间线</b><br><i>点击或鼠标悬停于数据点以查看事件名称</i>',
    hovermode: 'closest',
    dragmode: 'zoom',
    xaxis: {
      title: {
        text: '时间',
      },
      type: 'date',
      showgrid: true,
      rangeselector: {
        x: 0.1,
        y: 1,
        buttons: [
          {
            step: 'year',
            stepmode: 'backward',
            count: 5,
            label: '5y'
          },
          {
            step: 'year',
            stepmode: 'backward',
            count: 10,
            label: '10y'
          },
          {
            step: 'year',
            stepmode: 'backward',
            count: 15,
            label: '15y'
          },
          {
            step: 'year',
            stepmode: 'backward',
            count: 20,
            label: '20y'
          },
          {
            step: 'all'
          }
        ]
      },
      rangeslider: {
        yaxis: {
          rangemode: 'match'
        }
      },
      tickmode: 'linear',
      dtick: 'M12',
      tick0: '2000-01-01'
    },
    yaxis: {
      title: {
        text: '星期'
      },
      ticktext: weekDays.map(d => `${d}<br><br>`),
      tickvals: [0, 1, 2, 3, 4, 5, 6],
      showgrid: true,
      fixedrange: false
    },
    shapes: [
      {
        type: 'line',
        editable: false,
        layer: 'above',
        line: {
          width: 1,
          color: 'black',
          dash: 'dashdot'
        },
        xref: 'paper',
        x0: 0,
        x1: 1,
        yref: 'y',
        y0: 7,
        y1: 7
      },
      /*{
        type: 'line',
        editable: false,
        layer: 'above',
        line: {
          width: 1,
          color: 'blue',
          dash: 'dot'
        },
        xref: 'x',
        x0: '2020-07-09',
        x1: '2020-07-09',
        yref: 'y',
        y0: 0,
        y1: 7
      },*/
      ...termShapes
    ]
  }

  Plotly.newPlot('chart', eventData.concat(termData), layout)
})

function prepEventData(rawData) {
  let dataSets = []
  let x = []
  let y = []
  let text = []
  let groups = rawData.reduce((groups, entry) => {
    if (!groups[entry.group]) {
      groups[entry.group] = []
    }
    groups[entry.group].push(entry)
    return groups
  }, {})

  return Object.keys(groups).map((name, index) => {
    let x = []
    let y = []
    let hovertext = []

    groups[name].map(entry => {
      let date = new Date(Date.parse(entry.date))
      let dayString = weekDays[date.getUTCDay()]

      x.push(entry.date)
      y.push(date.getUTCDay() + (Math.random() * 0.6 + 0.2))
      let entryText = `${entry.date}, ${dayString}<br>${entry.name.match(/.{1,50}/g).join('<br>')}`
      hovertext.push(entryText)
    })

    return {
      type: 'scatter',
      mode: 'markers',
      hoverinfo: 'text',
      name: name,
      marker: {
        symbol: index,
        opacity: 0.5
      },
      x,
      y,
      hovertext,
      hoverlabel: {
        align: 'left'
      }
    }
  })
}

function prepTermData(data) {
  let x = []
  let y = []
  let text = []

  data.map(term => {
    x.push(term.timeFrom)
    y.push(7.8)
    text.push(term.name)
  })

  return {
    type: 'scatter',
    mode: 'text',
    hoverinfo: 'none',
    showlegend: false,
    textposition: 'bottom right',
    x,
    y,
    text
  }
}

function prepTermShapes(data) {
  return data.map((term, index) => {
    return {
      type: 'rect',
      layer: 'above',
      editable: false,
      opacity: 0.2,
      xref: 'x',
      fillcolor: shapeColors[index],
      x0: term.timeFrom,
      x1: term.timeTo,
      yref: 'paper',
      y0: 0,
      y1: 1,
      line: {
        width: 0
      }
    }
  })
}