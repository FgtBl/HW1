class Order {
    constructor(items) {
        this.items = items;
    }

    calculateTotal() {
        let total = 0;

        for (const item of this.items) {
            total += item.price * item.qty;
        }

        if (total > 10000) {
            total *= 0.95;
        }

        return total;
    }
}

class OrderRepository {
    async save(userId, total) {
        await db.query(
            "INSERT INTO orders (user_id, total) VALUES ($1, $2)",
            [userId, total]
        );
    }
}

class OrderNotifier {
    async sendOrderAccepted(email) {
        await smtp.send(email, "Заказ принят");
    }
}

const orderRepository = new OrderRepository();
const orderNotifier = new OrderNotifier();

async function createOrder(req, res) {
    const body = JSON.parse(req.body);

    if (!body.items.length) {
        return res.status(400).send("empty");
    }

    const order = new Order(body.items);
    const total = order.calculateTotal();

    await orderRepository.save(req.user.id, total);

    await orderNotifier.sendOrderAccepted(req.user.email);

    res.status(201).send(JSON.stringify({ total }));
}
