from collections import namedtuple
import math

Order = namedtuple('Order', 'id, items')
Item = namedtuple('Item', 'type, description, amount, quantity')

def validorder(order: Order):
    net = 0

    for item in order.items:
        if item.type == 'payment':
            net += item.amount
        elif item.type == 'product':
            net -= item.amount * item.quantity
        else:
            return "Invalid item type: %s" % item.type

    # Check if the absolute difference between net and 0 is within a tolerance
    if math.isclose(net, 0, abs_tol=0.001):
        return "Order ID: %s - Full payment received!" % order.id
    else:
        return "Order ID: %s - Payment imbalance: $%0.2f" % (order.id, net)


import unittest
import code as c

class TestOnlineStore(unittest.TestCase):

    # Tricks the system and walks away with 1 television, despite valid payment & reimbursement
    def test_6(self):
        tv_item = c.Item(type='product', description='tv', amount=1000.00, quantity=1)
        payment = c.Item(type='payment', description='invoice_4', amount=1e19, quantity=1)
        payback = c.Item(type='payment', description='payback_4', amount=-1e19, quantity=1)
        order_4 = c.Order(id='4', items=[payment, tv_item, payback])
        self.assertEqual(c.validorder(order_4), 'Order ID: 4 - Payment imbalance: $-1000.00')

    # Valid payments that should add up correctly, but do not
    def test_7(self):
        small_item = c.Item(type='product', description='accessory', amount=3.3, quantity=1)
        payment_1 = c.Item(type='payment', description='invoice_5_1', amount=1.1, quantity=1)
        payment_2 = c.Item(type='payment', description='invoice_5_2', amount=2.2, quantity=1)
        order_5 = c.Order(id='5', items=[small_item, payment_1, payment_2])
        self.assertEqual(c.validorder(order_5), 'Order ID: 5 - Full payment received!')

    # The total amount payable in an order should be limited
    def test_8(self):
        num_items = 12
        items = [c.Item(type='product', description='tv', amount=99999, quantity=num_items)]
        for i in range(num_items):
            items.append(c.Item(type='payment', description='invoice_' + str(i), amount=99999, quantity=1))
        order_1 = c.Order(id='1', items=items)
        self.assertEqual(c.validorder(order_1), 'Total amount payable for an order exceeded')

        # Put payments before products
        items = items[1:] + [items[0]]
        order_2 = c.Order(id='2', items=items)
        self.assertEqual(c.validorder(order_2), 'Total amount payable for an order exceeded')

if __name__ == '__main__':
    unittest.main()