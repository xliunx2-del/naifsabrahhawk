# -*- coding: utf-8 -*-
import os
import csv
import torch
import torch.nn as nn
import torch.optim as optim
from tqdm import tqdm

# -------------------------
# إعداد الملفات
# -------------------------
foods = ["بيتزا", "سلطه", "كتكوت", "طماط", "بقره", "بيبار", "سمكة", "جزر", "جمبري", "ذرة"]
data_file = "data.csv"
acc_file = "accuracy.txt"
model_file = "interactive_transformer.pth"

if not os.path.exists(data_file):
    with open(data_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["food"])

# -------------------------
# إدخال جولة جديدة
# -------------------------
def add_new_round(new_round):
    new_round = new_round.replace("\n"," ").split()
    with open(data_file, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        for food in new_round:
            if food in foods:
                writer.writerow([food])
    print("✅ تمت إضافة الجولة الجديدة")

# -------------------------
# تحميل البيانات
# -------------------------
def load_dataset():
    dataset = []
    with open(data_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            dataset.append(row["food"])
    print("📊 عدد العينات في قاعدة البيانات:", len(dataset))
    return dataset

# -------------------------
# نموذج Transformer
# -------------------------
class FoodTransformer(nn.Module):
    def __init__(self, vocab_size, embed_size=64, nhead=4, num_layers=2, hidden_dim=128):
        super(FoodTransformer, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embed_size)
        self.pos_encoder = nn.Parameter(torch.zeros(1, 1000, embed_size))
        encoder_layers = nn.TransformerEncoderLayer(d_model=embed_size, nhead=nhead, dim_feedforward=hidden_dim)
        self.transformer_encoder = nn.TransformerEncoder(encoder_layers, num_layers=num_layers)
        self.fc_out = nn.Linear(embed_size, vocab_size)

    def forward(self, x):
        x = self.embedding(x) + self.pos_encoder[:, :x.size(1), :]
        x = self.transformer_encoder(x)
        return self.fc_out(x)

# -------------------------
# إعداد البيانات
# -------------------------
def prepare_data(dataset):
    food_to_idx = {food: i for i, food in enumerate(foods)}
    idx_to_food = {i: food for i, food in enumerate(foods)}

    X, Y = [], []
    for i in range(len(dataset)-1):
        X.append(food_to_idx[dataset[i]])
        Y.append(food_to_idx[dataset[i+1]])

    X = torch.tensor(X).unsqueeze(0)
    Y = torch.tensor(Y)
    return X, Y, food_to_idx, idx_to_food

# -------------------------
# التدريب مع التفاعل
# -------------------------
def train_interactive(model, X, Y, total_epochs=1000, lr=0.01, update_interval=50):
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    best_accuracy = 0.0

    if os.path.exists(acc_file):
        with open(acc_file, "r", encoding="utf-8") as f:
            try:
                best_accuracy = float(f.read().strip())
            except:
                best_accuracy = 0.0
    print(f"📌 أفضل دقة سابقة: {best_accuracy:.2f}%")

    if os.path.exists(model_file):
        model.load_state_dict(torch.load(model_file))
        print("📂 تم تحميل أفضل نموذج سابق من", model_file)

    model.train()
    for epoch in tqdm(range(1, total_epochs+1), desc="Training"):
        optimizer.zero_grad()
        outputs = model(X)
        outputs = outputs[0]
        loss = criterion(outputs, Y)
        loss.backward()
        optimizer.step()

        _, predicted = torch.max(outputs, 1)
        correct = (predicted == Y).sum().item()
        accuracy = 100 * correct / len(Y)

        if accuracy > best_accuracy:
            best_accuracy = accuracy
            with open(acc_file, "w", encoding="utf-8") as f:
                f.write(str(best_accuracy))
            torch.save(model.state_dict(), model_file)

        # تحديث التنبؤات كل update_interval
        if epoch % update_interval == 0:
            print(f"\n📌 Epoch {epoch}/{total_epochs} - Loss: {loss.item():.4f}, Accuracy: {accuracy:.2f}%")
            predict_next(model, food_to_idx, idx_to_food, top_k=4)

# -------------------------
# التنبؤ بأفضل 4 أطعمة
# -------------------------
def predict_next(model, food_to_idx, idx_to_food, top_k=4):
    model.eval()
    with torch.no_grad():
        for food in foods:
            test_idx = torch.tensor([[food_to_idx[food]]])
            prediction = model(test_idx)
            prediction = prediction[0, -1, :]
            probs = torch.softmax(prediction, dim=0)
            top_probs, top_indices = torch.topk(probs, top_k)
            print(f"\n🍽 {food} ➝ التوقعات القادمة:")
            for i in range(top_k):
                print(f"   {i+1}. {idx_to_food[top_indices[i].item()]} ({top_probs[i].item()*100:.2f}%)")

# -------------------------
# اللعب أثناء التدريب
# -------------------------
def play_next(model, food_to_idx, idx_to_food):
    while True:
        choice = input("\nأدخل اسم الطعام لتوقع القادم (أو 'exit' للخروج): ")
        if choice.lower() == 'exit':
            break
        if choice not in foods:
            print("⚠️ الطعام غير موجود في القائمة!")
            continue
        test_idx = torch.tensor([[food_to_idx[choice]]])
        prediction = model(test_idx)
        prediction = prediction[0, -1, :]
        probs = torch.softmax(prediction, dim=0)
        top_probs, top_indices = torch.topk(probs, 4)
        print(f"\n🍽 {choice} ➝ التوقعات القادمة:")
        for i in range(4):
            print(f"   {i+1}. {idx_to_food[top_indices[i].item()]} ({top_probs[i].item()*100:.2f}%)")

# -------------------------
# التنفيذ
# -------------------------
if __name__ == "__main__":
    # إضافة جولة جديدة
    new_round_text = "جمبري طماط ذرة جزر بيبار طماط بيبار ذرة"
    add_new_round(new_round_text)

    # تحميل البيانات
    dataset = load_dataset()

    # إعداد البيانات
    X, Y, food_to_idx, idx_to_food = prepare_data(dataset)

    # إنشاء النموذج
    model = FoodTransformer(len(foods))

    # بدء التدريب التفاعلي
    train_interactive(model, X, Y, total_epochs=1000, lr=0.01, update_interval=50)

    # اللعب بعد التدريب
    play_next(model, food_to_idx, idx_to_food)
