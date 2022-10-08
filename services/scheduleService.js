function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

const dayToNumMap = {
    "MON" : 0,
    "TUE" : 1,
    "WED" : 2,
    "THU" : 3,
    "FRI" : 4,
    "SAT" : 5
}

function convertTimeToIndex(start_time, end_time) {
    if (start_time[0] == "0"){
        start_time_hour = start_time.slice(1,2);
    } else{
        start_time_hour = start_time.slice(0,2);
    }
    start_time_minute = start_time.slice(2,4);

    start_time_index = 0;
    if (start_time_minute == "30"){
        start_time_index += 1;
    }

    start_time_index += (parseInt(start_time_hour) - 8) * 2;

    if (end_time[0] == "0"){
        end_time_hour = end_time.slice(1,2);
    } else{
        end_time_hour = end_time.slice(0,2);
    }
    end_time_minute = end_time.slice(2,4);

    end_time_index = 0;
    if (end_time_minute == "30"){
        end_time_index += 1;
    }

    end_time_index += (parseInt(end_time_hour) - 8) * 2;

    return [start_time_index, end_time_index];
}

const GenerateScheduleFromString = async(req,res) =>{
    const schedule = req.body.schedule;
    
    var courseCode = "";
    var scheduleArray =  new Array(5).fill("").map(() => new Array(32).fill("")); // 5 days, 32 timeslots (start: 8 - 8.30, end: 23.00 - 23.30)
    var i = 0;
    while(i < schedule.length){
        if (i + 5 < schedule.length && schedule.slice(i,i+2).match(/^[a-zA-Z()]*$/) && schedule.slice(i+2,i+6).match(/^-?\d+$/)){
            courseCode = schedule.slice(i,i+6);
            i += 6;
        } else if (i+2 < schedule.length && schedule.slice(i,i+3) == "TUT"){
            group = schedule.slice(i+3, i+6);
            day = schedule.slice(i+6, i+9); 
            time_start = schedule.slice(i+9, i+13);
            if (!time_start.match(/^-?\d+$/)) {
                i += 3;
                continue;
            }

            time_end = schedule.slice(i+14, i+18);
            if (!time_end.match(/^-?\d+$/)) {
                i += 3;
                continue;
            }

            venue_code = schedule.slice(i+18, i+20);
            j = i + 20;
            while (j < schedule.length && (isNumeric(schedule[j]) || schedule[j] == '+')){
                j += 1;
            }
            
            if (schedule[j] == "A"){
                venue_number = schedule.slice(i+20, j+1);
            } else{
                venue_number = schedule.slice(i+20, j);
            }
            i = j;
            //console.log(courseCode + group + day + time_start + time_end + venue_code + venue_number)

            dayNum = dayToNumMap[day];
            [start_time_index, end_time_index] = convertTimeToIndex(time_start, time_end);

            for(k=start_time_index; k< end_time_index + 1; k++){
                scheduleArray[dayNum][k] = "TUT" + courseCode + " " + group + " " + day + " " + time_start + "-" + time_end + " " + venue_code + venue_number;
            }
        } else if (i+2 < schedule.length && schedule.slice(i,i+3) == "LAB"){
            group = schedule.slice(i+3, i+6);
            day = schedule.slice(i+6, i+9);
            time_start = schedule.slice(i+9, i+13);
            if (!time_start.match(/^-?\d+$/)) {
                i += 3;
                continue;
            }
            time_end = schedule.slice(i+14, i+18);
            if (!time_end.match(/^-?\d+$/)) {
                i += 3;
                continue;
            }

            j = i+18;
            while( j < schedule.length && schedule.slice(j, j+8) != "Teaching") {
                j += 1
            }
            venue = schedule.slice(i+18, j);

            // console.log(courseCode + group + day + time_start + time_end + venue)
            i = j;

            dayNum = dayToNumMap[day];
            [start_time_index, end_time_index] = convertTimeToIndex(time_start, time_end);

            for(k=start_time_index; k< end_time_index + 1; k++){
                scheduleArray[dayNum][k] = "LAB" + courseCode + " " + group + " " + day + " " + time_start + "-" + time_end + " " + venue;
            }
        } else if (i+10 < schedule.length && schedule.slice(i,i+10) == "LEC/STUDIO" ){
            group = schedule.slice(i+10, i+13);
            day = schedule.slice(i+13, i+16);
            time_start = schedule.slice(i+16, i+20);
            if (!time_start.match(/^-?\d+$/)) {
                i += 3;
                continue;
            }
            time_end = schedule.slice(i+21, i+25);
            if (!time_end.match(/^-?\d+$/)) {
                i += 3;
                continue;
            }
            venue_code = schedule.slice(i+25, i+27);
            j = i + 27;
            while (j < schedule.length && (isNumeric(schedule[j]) || schedule[j] == '+')){
                j += 1;
            }
            
            if (schedule[j] == "A"){
                venue_number = schedule.slice(i+27, j+1);
            } else{
                venue_number = schedule.slice(i+27, j);
            }
            i = j;
            // console.log(courseCode + group + day + time_start + time_end + venue_code+ venue_number);
            dayNum = dayToNumMap[day];
            [start_time_index, end_time_index] = convertTimeToIndex(time_start, time_end);

            for(k=start_time_index; k< end_time_index + 1; k++){
                scheduleArray[dayNum][k] = "LEC/STUDIO" + courseCode + " " + group + " " + day + " " + time_start + "-" + time_end + " " + venue_code + venue_number;
            }
        } else if (i+2 < schedule.length && schedule.slice(i,i+3) == "SEM"){
            group = schedule.slice(i+3, i+4);
            day = schedule.slice(i+4, i+7);
            time_start = schedule.slice(i+7, i+11);
            if (!time_start.match(/^-?\d+$/)) {
                i += 3;
                continue;
            }
            time_end  = schedule.slice(i+12, i+16);
            if (!time_start.match(/^-?\d+$/)) {
                i += 3;
                continue;
            }
            j = i+16;
            while(j < schedule.length && schedule[j] != "\\" && schedule[j] != " " && schedule[j] != "["){
                j += 1
            }
            venue = schedule.slice(i+16, j);
            i = j
            // console.log(courseCode + group + day + time_start + time_end + venue)
            dayNum = dayToNumMap[day];
            [start_time_index, end_time_index] = convertTimeToIndex(time_start, time_end);

            for(k=start_time_index; k< end_time_index + 1; k++){
                scheduleArray[dayNum][k] = "SEM" + courseCode + " " + group + " " + day + " " + time_start + "-" + time_end + " " + venue_code + venue_number;
            }
        }
        else{
            i += 1
        }
    }
    return res.status(200).json({
        message: "success",
        data: scheduleArray,
        error: false,
    });
}

const findPossibleSchedule = async (req, res) => {
    
}

const scheduleService = {
    GenerateScheduleFromString
};

module.exports = scheduleService;