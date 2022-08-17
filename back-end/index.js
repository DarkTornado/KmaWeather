const http = require('http');
const axios = require('axios');

http.createServer(async (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8;'
    });
    //파라미터로 넘어온게 없으면 아무것도 안함
    if (!req.url.includes('?')) {
        res.write('[]');
        res.end();
        return;
    }

    //파라미터 분리
    const query = req.url.split('?');
    const params = query2object(query[1]);

    //날씨 API
    if (req.url.startsWith('/weather')) {
        const result = await getWeather(params);
        res.write(JSON.stringify(result));
    }

    res.end();
}).listen(8080);

const query2object = (query) => {
    const result = {};
    const data = query.split('&');
    for (let n = 0; n < data.length; n++) {
        const datum = data[n].split('=');
        result[datum[0]] = datum[1];
    }
    return result;
}

const getWeather = async (params) => {
    const key = '안알랴줌';
    const url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=' + key + '&pageNo=1&numOfRows=1000&dataType=JSON&base_date=' + getDate() + '&base_time=2300&nx=' + params.x + '&ny=' + params.y;
    var data = await axios.get(url, {}, {});
    if (data.data.response.body === undefined) return [];
    data = data.data.response.body.items.item;
    const result = {};
    for (let n = 0; n < data.length; n++) {
        const datum = data[n];
        const time = datum.fcstTime;
        if (result[time] == undefined) result[time] = {};
        result[time][datum.category] = datum.fcstValue;
    }
    return parseData(result);
}

const getDate = () => {
    const now = new Date(new Date() - 24 * 60 * 60 * 1000);
    const y = now.getFullYear();
    let m = now.getMonth() + 1;
    if (m < 10) m = '0' + m;
    let d = now.getDate();
    if (d < 10) d = '0' + d;
    return '' + y + m + d;
}

const parseData = (data) => {
    const result = [];
    const skys = [null, '맑음', null, '구름많음', '흐림'];
    const rains = [null, '비', '비 또는 눈', '눈', '소나기'];
    for (let n = 0; n < 24; n++) {
        let time = n + '00';
        if (time.length == 3) time = '0' + time;
        const datum = data[time];
        result[n] = {};
        result[n].time = n + '시';
        result[n].sky = datum.PTY == 0 ? skys[datum.SKY] : rains[datum.PTY];
        result[n].tmp = datum.TMP + '℃';
        result[n].hum = datum.REH + '%';
        result[n].wind_dir = deg2dir(datum.VEC) + '풍';
        result[n].wind_speed = datum.WSD + 'm/s';
        result[n].rain = datum.POP + '%';
    }
    return result;
}

const deg2dir = (deg) => {
    const dirs = ['북', '북동', '동', '남동', '남', '남서', '서', '북서', '북'];
    const dir = (parseInt(deg) + 22.5) / 45;
    return dirs[parseInt(dir)];
}

