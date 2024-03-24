function handleWithdraw(userId) {
    const amount = prompt('Please enter the amount you want to withdraw:');
    if (amount) {
        fetch('/user/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({userId, amount: parseFloat(amount)}),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Withdrawal successful!');
                window.location.reload();
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function updateBalancesNow() {
    // Gửi request để cập nhật số dư tức thì cho tất cả người dùng
    fetch('/user/update-balances-now', {
        method: 'POST',
    })
        .then(response => response.json())
        .then(data => {
            alert('Update successful!');
            window.location.reload();
        })
        .catch(error => console.error(error));
}
