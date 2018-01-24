$(function () {
  let subBtn = document.querySelector('#subBtn');
  let search = document.querySelector('#search');
  let tbody = document.querySelector('#tbody');
  let updateBtn = document.querySelector("#updateBtn");
  let removeBtn = document.querySelector("#removeBtn");


  const render = arr => { // render
    if (_.isEmpty(arr)) {
      tbody.innerHTML = '';
    }else {

      let html = '';
      for (var i = 0; i < arr.length; i++) {
        html += `
          <tr>
            <td class="text-center">${i+1}</td>
            <td class="text-center">${arr[i].quiz}</td>
            <td class="text-center">A:${arr[i].options[0]}， B:${arr[i].options[1]}， C:${arr[i].options[2]}， D:${arr[i].options[3]}</td>
            <td class="text-center">${arr[i].school}</td>
            <td class="text-center">${arr[i].type}</td>
            <td class="text-center">${arr[i].contributor}</td>
            <td class="text-center">${arr[i].answer}</td>
          </tr>
        `;
      }

      tbody.innerHTML = html;
    }
  }

  // const initPager = (leng) => {
  //   $('#pager').page({
  //     leng: leng,//分页总数
  //     activeClass: 'activP', //active 类样式定义
  //     clickBack: function (page) {
  //       console.log(page)
  //       getData(search.value, page-1);
  //     }
  //   })
  // }

  const getData = (val, skip) => { // 获取数据
    $.ajax({
      url: 'http://192.168.1.77:3000/index',
      type: 'POST',
      dataType: 'json',
      data: {
        "search": val,
        "limit": 10,
        "skip": skip
      },
      success: function (data) {
        render(data.data)
        
        // MD,这插件有问题
        $('#pager').page({
          leng: Math.ceil(data.count / 10),//分页总数
          activeClass: 'activP', //active 类样式定义
          clickBack: function (page) {
            $.post("http://192.168.1.77:3000/index", {
              "search": val,
              "limit": 10,
              "skip": parseInt(page - 1)
            }, function(result){
              // $('#pager').setLength(Math.ceil(result.count / 10))
              render(result.data)
            })
          }
        })
      },
      error: function (err) {
        console.log(err)
      }
    })
  }

  subBtn.addEventListener("click", _.debounce(function () {
    console.log('enter')
    getData(search.value, 0)
  }, 300, { 'maxWait': 1000 }), false)

  getData('', 0)

  updateBtn.addEventListener("click",_.debounce(function() {
    console.log("enter2");
    $.post("http://192.168.1.77:3000/update",function(result) {
      console.log(result);
      if (result.n === 1 && result.nModified === 1) {
        $(".alert-success").fadeIn("fast").delay("3000").fadeOut("slow");
      }else {
        $(".alert-warning").fadeIn("fast").delay("3000").fadeOut("slow");
      }
    })
  }, 300, { 'maxWait': 1000 }), false)
// removeBtn
  removeBtn.addEventListener("click", _.debounce(function () {
    console.log("enter2");
    $.post("http://192.168.1.77:3000/remove",{
      "id": parseInt(Math.random() * 100 + 10)
    }, function (result) {
      console.log(result);
      if (result.n === 1) {
        $(".alert-success").fadeIn("fast").delay("3000").fadeOut("slow");
      } else {
        $(".alert-warning").fadeIn("fast").delay("3000").fadeOut("slow");
      }
    })
  }, 300, { 'maxWait': 1000 }), false)
})