class TeamModel {
  final String id;
  final String name;
  final String? description;
  final String createdBy;
  final String userRole; // 'admin' veya 'member'

  TeamModel({
    required this.id,
    required this.name,
    this.description,
    required this.createdBy,
    this.userRole = 'member',
  });

  bool get isCreator => createdBy == 'CURRENT_USER_ID'; // Kurucu Kontrolü
  bool get isAdmin => userRole == 'admin' || isCreator;

  factory TeamModel.fromJson(Map<String, dynamic> json, {String currentUserId = ''}) {
    return TeamModel(
      id: json['id'],
      name: json['name'] ?? 'İsimsiz Ekip',
      description: json['description'],
      createdBy: json['created_by'] ?? '',
      userRole: json['created_by'] == currentUserId ? 'admin' : (json['role'] ?? 'member'),
    );
  }
}

class TeamMemberModel {
  final String id;
  final String teamId;
  final String userId;
  final String fullName;
  final String email;
  String role; // 'admin' veya 'member'

  TeamMemberModel({
    required this.id,
    required this.teamId,
    required this.userId,
    required this.fullName,
    required this.email,
    this.role = 'member',
  });

  bool get isAdmin => role == 'admin';

  factory TeamMemberModel.fromJson(Map<String, dynamic> json) {
    return TeamMemberModel(
      id: json['id'],
      teamId: json['team_id'],
      userId: json['user_id'],
      fullName: json['full_name'] ?? 'İsimsiz Üye',
      email: json['email'] ?? '',
      role: json['role'] ?? 'member',
    );
  }
}
