// cookies manipulation
function setCookie(name, value, expires) {

    let date = new Date();
    date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

function getCookie(name) {

    name += '=';
    let cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length);
        }
    }
    return '';
}

// helper functions for schedule manipulation
function selectSchedule(id) {

    //todo selectSchedule
}

function updateScheduleList() {

    sessionStorage.setItem('scheduleList', JSON.stringify(scheduleList));

    console.log('updateScheduleList: scheduleList updated');
    console.log(scheduleList);
}

function addCourseToSchedule(schedule_id, course_id, course_sections, overwrite = false) {

    for (let schedule of scheduleList) {

        if (schedule.id === schedule_id) {

            let course = course_id in schedule.data;

            if (course === undefined || !course) {
                // todo add to view
            } else {
                // todo smth
            }

            schedule.data[course_id] = course_sections;
            break;
        }
    }

    updateScheduleList();
}

// helper functions for course data manipulation
function addCourseDataToStorage(id, data) {

    let key = `CourseID${id}`;
    sessionStorage.setItem(key, JSON.stringify(data));
}

function getCourseDataFromStorage(id) {

    let key = `CourseID${id}`,
        data = sessionStorage.getItem(key);

    if (!data) {
        return 0;
    }

    return JSON.parse(data);
}

function addCourseView(id) {

    let data = getCourseDataFromStorage(id);

    if (!data) {
        console.log('addCourseView(): could not retrieve data');
        return 0;
    }

    let info = semester_data.filter((course) => {
        return course.COURSEID === id
    })[0];

    console.log('addCourseView():');
    console.log(data);
    console.log(info);

    $('#course-list-view').append(`<li>${info.ABBR}</li>`)

    return 1;
}

$(document).ready(function () {

    // load schedule list from cookie
    {
        let schedules = sessionStorage.getItem('scheduleList');

        if (!schedules) {
            sessionStorage.setItem('scheduleList', JSON.stringify(scheduleList));
            console.log('onReady: scheduleList initialized');
        } else {
            scheduleList = JSON.parse(schedules);
            console.log('onReady: scheduleList loaded');
        }

        console.log(scheduleList);
        selectSchedule(1);
    }

    // // Search filter for Course Selector
    // $('#course-selector').on('input', function () {
    //     filteredCourseList = filtered_course_list;
    //     // if (filtered_course_list.length <= 10) {
    //     //     $('#filtered-course-list').empty();
    //     //     for (const course of filtered_course_list) {
    //     //         $('#filtered-course-list').append(`
    //     //                     <div class="filtered-course" data-id="${course.COURSEID}" onclick="selectCourse(this)">
    //     //                         ${course.ABBR}
    //     //                     </div>
    //     //                 `);
    //     //     }
    //     //     $('#filtered-course-list').show();
    //     // } else {
    //     //     $('#filtered-course-list').hide();
    //     // }
    // });

    // Autocomplete for Course Selector
    $('#course-selector').autocomplete({
        autoFocus: true,
        delay: 100,
        minLength: 2,
        source: function (req, res) {
            let filtered_course_list = semester_data.filter(function (course) {
                return course.ABBR.toLowerCase().indexOf(req.term.toLowerCase()) !== -1;
            });

            res($.map(filtered_course_list, function (course) {
                return {
                    label: course.ABBR,
                    value: course.COURSEID
                }
            }));
        },

        select: function (event, ui) {
            let course_name = ui.item.label,
                course_id = ui.item.value,
                get_url = `/json?method=getCourseById&courseId=${course_id}&semesterId=${semester_code}`,
                selected_schedule_id = $('#schedule-selector option:selected').val();

            $(this).val('');
            // todo loading anime
            // get course data
            // todo normal check if course is in schedule
            if (getCourseDataFromStorage(course_id)) {
                addCourseToSchedule(selected_schedule_id, course_id, [], 0);
                addCourseView(course_id);
                return false;
            }

            $.get(get_url, function (course_data) {
                addCourseToSchedule(selected_schedule_id, course_id, [], 0);
                addCourseDataToStorage(course_id, course_data);
                addCourseView(course_id);
            });

            event.preventDefault();
        }
    });
});