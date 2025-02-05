let cl = console.log;
  
const postform = document.getElementById('postform')
const Titlecontrol = document.getElementById('title')
const Contentvalue = document.getElementById('content')
const userid = document.getElementById('userid')
const submitBtn = document.getElementById('submitBtn')
const updateBtn = document.getElementById('updateBtn')
const postcontainer = document.getElementById('postcontainer')

const loader = document.getElementById('loader')
loader.classList.add('d-none');


const BaseUrl =`https://fir-promise-197e7-default-rtdb.firebaseio.com`
const PostUrl =`${BaseUrl}/posts.json`;

const snackbar = (title, icon) => {
    swal.fire({
      title,
      icon,
      timer: 2500,
    });
  };

  
const onEdit =(ele) =>{
    let EditedID = ele.closest('.card').id;
    localStorage.setItem('EditedID', EditedID)

    let editURL =`${BaseUrl}/posts/${EditedID}.json`;

    MakeApicall("GET", editURL, null)
        .then((res =>{
            Titlecontrol.value = res.title;
            Contentvalue.value = res.content;
            userid.value = res.userid;
            submitBtn.classList.add('d-none')
            updateBtn.classList.remove('d-none')
        }))
        .catch(err =>{
            
        })
}
const onDelete =(ele)=>{
    let removeId = ele.closest('.card').id;
    let removeURL =`${BaseUrl}/posts/${removeId}.json`

     
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
          }).then((result) => {
            if (result.isConfirmed) {
                MakeApicall('DELETE', removeURL)
                .then(res =>{
                    ele.closest('.card').remove()
                })
                .catch( err =>{
                    snackbar(`The post has been Deleted Successfully!!`, "succes")
                })
            }
          });
}
const OnupdateBtn = ()=>{
    let updatedobj ={
        title: Titlecontrol.value,
        content: Contentvalue.value,
        userid : userid.value
    }
    postform.reset();

    let updatedId = localStorage.getItem('EditedID')
    let upadtedURL =`${BaseUrl}/posts/${updatedId}.json`;

    MakeApicall("PATCH", upadtedURL, updatedobj)
        .then(res =>{
            let card = document.getElementById(updatedId).children;
            card[0].innerHTML= `<h3 class="mb-0">${updatedobj.title}</h3>`
            card[1].innerHTML= `<p class="mb-0">${updatedobj.content}</p>`

            updateBtn.classList.add('d-none')
            submitBtn.classList.remove('d-none')
            snackbar(`The post is Updated Successfully!!!`, "success");

        })
        .catch(err =>{
          snackbar(err, 'error')
        })
}
const templating =(arr)=>{
     let result ="";
     arr.forEach(card => {
        result +=`
            <div class="card mb-4" id="${card.id}">
                <div class="card-header">
                    <h3 class="mb-0">${card.title}</h3>
                </div>
                <div class="card-body">
                    <p class="mb-0">${card.content}</p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class=" btn btn-primary" Onclick="onEdit(this)">EditBtn</button>
                    <button class=" btn btn-danger" Onclick="onDelete(this)">RemoveBtn</button>
                </div>
            </div>       
        `
     });
     postcontainer.innerHTML = result;
}
 
const CreateCard =(obj, res)=>{
        let card = document.createElement('div');
        card.className = "card mb-4";
        card.id = res.name; 
        card.innerHTML =
                    `
                <div class="card-header">
                    <h3 class="mb-0">${obj.title}</h3>
                </div>
                <div class="card-body">
                    <p class="mb-0">${obj.content}</p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn-btn-sm btn btn-info" Onclick="onEdit(this)">EditBtn</button>
                    <button class="btn-btn-sm btn btn-danger" Onclick="onDelete(this)">RemoveBtn</button>
                </div>                             
           `
        postcontainer.append(card)
}
const ObjToArray =(obj) => Object.keys(obj).map(key =>({
        ...obj[key], id:key
}))

const MakeApicall = (Methodname, apiurl, body = null)=>{
    return new Promise((resolve, reject) =>{   
        let msgBody = body ? JSON.stringify(body): null;
        loader.classList.remove('d-none');
        let xhr = new XMLHttpRequest();
        xhr.open(Methodname, apiurl);
        xhr.setRequestHeader("content-type", "application/json")
        xhr.setRequestHeader("Authorization", "JWT access token from localstorage")
        xhr.onload = function(){
            loader.classList.add('d-none')
            if(xhr.status >= 200 && xhr.status <= 299){
                let data = JSON.parse(xhr.response)
                resolve(data)
            }else{
                reject(xhr.statusText)
            }
        }
        xhr.send(msgBody)
        xhr.onerror = function(){
            loader.classList.add('d-none');
            reject(xhr.responseText);
        }
    })
}

 const Allpostget =()=>{
    MakeApicall('GET', PostUrl)
.then(res =>{
    cl(res)
    let postarry = ObjToArray(res)
    cl(postarry)
    templating(postarry)
})
.catch(err =>{
    snackbar(err, "error");
})
 }
 Allpostget()

const OnpostSubmit =(eve) =>{
    eve.preventDefault();

    let obj ={
        title: Titlecontrol.value,
        content: Contentvalue.value,
        userid: userid.value
    }
    postform.reset()
    cl(obj)
    MakeApicall("POST", PostUrl, obj)
     .then(res =>{
        CreateCard(obj, res)
        snackbar('The new Post create Succussfully!!!', 'success')
     })
     .catch(err =>{

     })
}

postform.addEventListener("submit", OnpostSubmit)
updateBtn.addEventListener('click', OnupdateBtn)