import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
        
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getDatabase, ref, get, child, push } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

import { firebaseConfig } from "./firebase-config.js";

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);

$( document ).ready(function() {
    // read data from database
    isLoggedIn();
    initButton();

    document.querySelectorAll('#menu li').forEach(function(click){
        click.addEventListener("click", function(){
            scrollToSection(click.childNodes[0].attributes['data-target'].value);
        })
    });

    document.querySelectorAll('#tab-reservation li').forEach(function(click){
        click.addEventListener("click", function(){
            document.querySelectorAll(".menu-item").forEach(el => el.classList.remove('active'))
            click.childNodes[0].classList.add('active');

            document.getElementById('notification-reservation').classList.add('d-none');

            if (click.childNodes[0].attributes['id'].value == 'history-reservation') {
                document.getElementById('table-history-reservation').classList.remove('d-none');
                document.getElementById('form-reservation').classList.add('d-none');
                document.getElementById('preview-reservation').classList.add('d-none');

                readDataReservation();
            } else {
                document.getElementById('table-history-reservation').classList.add('d-none');
                document.getElementById('form-reservation').classList.remove('d-none');
                document.getElementById('preview-reservation').classList.add('d-none');
            }
        })
    });
});

const initButton = () => {
    const btnReservation = document.getElementById('btn-reservation');
    const btnSignout = document.getElementById('signout');
    const btnProcessReservation = document.getElementById('process-reservation');
    const btnResetForm = document.getElementById('reset-reservation');
    const btnSubmitReservation = document.getElementById('submit-reservation');

    btnReservation.addEventListener('click', openFormReservation)
    btnSignout.addEventListener('click', signout)
    btnProcessReservation.addEventListener('click', processReservation)
    btnResetForm.addEventListener('click', resetForm)
    btnSubmitReservation.addEventListener('click', save)
}

const signoutGoogle = async() => {
    signOut(auth).then(() => {
    }).catch((error) => {})
}

const isLoggedIn = () => {
    if ("uid" in localStorage && localStorage.getItem('uid')) {
        $('#menu-reservation').removeClass('d-none');
        $('#reservation').removeClass('d-none');
        $('#signout').removeClass('d-none');
        $('#signin').addClass('d-none');

        $('#name').val(localStorage.getItem('displayName'));
        $('#email').val(localStorage.getItem('email'));
        $('#value-email').val(localStorage.getItem('email'));
    } else {
        $('#menu-reservation').addClass('d-none');
        $('#reservation').addClass('d-none');
        $('#signout').addClass('d-none');
        $('#signin').removeClass('d-none');
    }
}

const openFormReservation = () => {
    if ("uid" in localStorage && localStorage.getItem('uid')) {
        scrollToSection('#reservation');
    } else {
        document.location.href = './pages/signin.html';
    }
}

const scrollToSection = (section) => {
    $('html,body').animate({
        scrollTop: $(section).offset().top - (section == '#reservation' ? 200 : 100)},
        'smooth');
}

const save = () => {
    // get value from form
    const data = getValueForm();

    if (data) {
        $('#form-reservation').addClass('d-none');
        $('#preview-reservation').removeClass('d-none');

        $('#value-name').html(data.name);
        $('#value-phone').html(data.phone);
        $('#value-email').html(data.email);
        $('#value-date').html(changetFormatDate(data.date));
        $('#value-level').html(data.level);
        $('#value-total-person').html(`${data.totalPerson} Orang`);
        $('#value-price').html(`Rp. ${data.price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`);

        scrollToSection('#reservation');
    }
}

const processReservation = () => {
    // get value from form
    const data = getValueForm();

    if (data) {
        // Get a reference to the database service
        const database = getDatabase(firebase);
        push(ref(database, 'reservations/' + localStorage.getItem('uid')), data)
        .then(function() {
            $('#process-reservation').addClass('d-none');
            $('#notification-reservation').removeClass('d-none');
            $('#alert-reservation').removeClass('danger');
            $('#alert-reservation').addClass('success');
            $('#alert-reservation').html('Reservasi Berhasil Dilakukan Silahkan Cek Email Anda untuk Melihat Riwayat Pemesanan!');
            $('#process-reservation').addClass('d-none');
            $('#reset-reservation').removeClass('d-none');

            scrollToSection('#reservation');
        })
        .catch(function(error) {
            alert("Error inserting data: ", error);
        });
    }
}

const readDataReservation = async () => {
    // Get a reference to the database service
    const dbRef = ref(getDatabase(firebase));
    const userId = localStorage.getItem('uid');
    get(child(dbRef, `reservations/${userId}`)).then((snapshot) => {
        let dataHistoryReservation = `<tr><td colspan="6" class="text-center">Data tidak tersedia</td></tr>`;
        if (snapshot.exists()) {
            dataHistoryReservation = ``;
            const data = snapshot.val();

            for (const key in data) {
                if (Object.hasOwnProperty.call(data, key)) {
                    const element = data[key];
                    
                    dataHistoryReservation += `
                        <tr>
                            <td align="left">
                                <div style="font-weight: bold;">${element.name}</div>
                                <div>${element.email}</div>
                                <div>${element.phone}</div>
                            </td>
                            <td class="text-center">${element.level}</td>
                            <td class="text-center">${element.totalPerson} Orang</td>
                            <td class="text-center">${changetFormatDate(element.date)}</td>
                            <td class="text-center">${element.payment}</td>
                            <td class="text-center">Rp. ${element.price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</td>
                        </tr>`;
                }
            }
        }

        $('#data-history-reservation').html(dataHistoryReservation);
    }).catch((error) => {
        console.error(error);
    });

}

const resetForm = () => {
    document.location.reload();
}

const getValueForm = () => {
    const totalPerson = $('#total-person').val();

    let result = {
        name: $('#name').val(),
        phone: $('#phone').val(),
        email: $('#email').val(),
        level: $('#level option:selected').text(),
        totalPerson: totalPerson,
        date: $('#date').val(),
        payment: $('#payment').val(),
        price: totalPerson * getPrice($('#level').val() - 1),
        uid: localStorage.getItem('uid')
    };

    for (const key in result) {
        if (Object.hasOwnProperty.call(result, key)) {
            const element = result[key];
            
            if (!element) {
                alert('Silahkan lengkapi form terlebih dahulu!');
                return false;
            }
        }
    }

    return result;
}

const getPrice = (index) => {
    const price = [
        20000,
        40000,
        60000
    ];

    return price[index];
}

const changetFormatDate = (date) => {
    const monthsArray = [
        "Januari", "Februari", "Maret", "April",
        "Mei", "Juni", "Juli", "Agustus",
        "September", "Oktober", "November", "Desember"
      ];
    var d = new Date(date);
    date = [
        ('0' + d.getDate()).slice(-2),
        monthsArray[d.getMonth()],
        d.getFullYear(),
    ].join(' ');

    return date;
}

const signout = () => {
    localStorage.clear();
    setTimeout(() => {
        document.location.reload();
        signoutGoogle();
    }, 500);
}